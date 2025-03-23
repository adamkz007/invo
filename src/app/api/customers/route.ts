import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { hasReachedLimit, hasTrialExpired, PLAN_LIMITS } from '@/lib/stripe';
import { User } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customers = await prisma.customer.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(customers);
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

    return NextResponse.json(customer);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
} 