import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { hasReachedLimit, hasTrialExpired, PLAN_LIMITS } from '@/lib/stripe';
import { User } from '@prisma/client';

const CUSTOMERS_TAG = (userId: string) => `customers:${userId}`;

type CustomerListOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parseQuery(req: NextRequest): CustomerListOptions {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limitParam = Number(searchParams.get('limit'));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const search = searchParams.get('search')?.trim() || undefined;
  return { page, limit, search };
}

const getCustomers = (userId: string) =>
  unstable_cache(
    async (options: CustomerListOptions) => {
      const page = options.page ?? 1;
      const limit = options.limit ?? DEFAULT_PAGE_SIZE;
      const skip = (page - 1) * limit;
      const where = {
        userId,
        ...(options.search
          ? {
              OR: [
                { name: { contains: options.search, mode: 'insensitive' } },
                { email: { contains: options.search, mode: 'insensitive' } },
                { phoneNumber: { contains: options.search } },
              ],
            }
          : {}),
      };

      const [customers, totalCount] = await Promise.all([
        prisma.customer.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.customer.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      return { data: customers, totalCount, totalPages, page, pageSize: limit };
    },
    ['customers', userId],
    {
      revalidate: 120,
      tags: [CUSTOMERS_TAG(userId)],
    },
  );

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const options = parseQuery(req);
    const customers = await getCustomers(user.id)(options);

    return NextResponse.json(customers, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=120',
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the complete user from the database with subscription info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cast the user to include subscription fields and use fallbacks
    const fullUser = dbUser as User & { 
      subscriptionStatus?: string | null;
      trialEndDate?: Date | null;
    };

    // Check subscription status
    const subscriptionStatus = fullUser.subscriptionStatus || 'FREE';
    const isTrialExpired = hasTrialExpired(fullUser.trialEndDate);
    
    // If trial has expired and user is still on trial, set to FREE
    if (isTrialExpired && subscriptionStatus === 'TRIAL') {
      await prisma.user.update({
        where: { id: user.id },
        data: { subscriptionStatus: 'FREE' } as any
      });
    }

    // Count existing customers
    const customerCount = await prisma.customer.count({
      where: { userId: user.id }
    });

    // Check if user has reached limit (if not on trial and not premium)
    if (subscriptionStatus !== 'ACTIVE' && (isTrialExpired || subscriptionStatus === 'FREE')) {
      const hasReachedCustomerLimit = hasReachedLimit(
        subscriptionStatus,
        'customers',
        customerCount
      );

      if (hasReachedCustomerLimit) {
        return NextResponse.json(
          { 
            error: 'You have reached your customer limit. Please upgrade to premium or delete existing customers to proceed.',
            limitReached: true,
            currentCount: customerCount,
            limit: PLAN_LIMITS.FREE.customers
          }, 
          { status: 403 }
        );
      }
    }

    // Proceed with creating customer
    const data = await req.json();
    
    // Check if a customer with the same phone number already exists
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        userId: user.id,
        phoneNumber: data.phoneNumber,
      }
    });

    if (existingCustomer) {
      return NextResponse.json(
        { 
          error: 'A customer with this phone number already exists', 
          duplicatePhone: true,
        }, 
        { status: 409 }
      );
    }
    
    // Create the customer
    const customer = await prisma.customer.create({
      data: {
        ...data,
        userId: user.id,
      },
    });

    // Invalidate cache for this user
    revalidateTag(CUSTOMERS_TAG(user.id));

    return NextResponse.json(customer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
