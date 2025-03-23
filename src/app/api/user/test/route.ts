import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // Get the authenticated user from the request
    const authenticatedUser = await getUserFromRequest(req);
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch the actual user data from the database
    const user = await prisma.user.findUnique({
      where: { id: authenticatedUser.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        stripeCustomerId: true,
        subscriptionStatus: true,
        currentPeriodEnd: true,
        trialStartDate: true,
        trialEndDate: true,
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 