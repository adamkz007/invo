import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import {
  isLifetimeUser,
  resolveBillingPlan,
  resolveEffectiveSubscriptionStatus,
} from '@/lib/subscription-status';

export async function GET(req: NextRequest) {
  try {
    
    // Get authenticated user from request
    const user = await getUserFromRequest(req);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get complete user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        subscriptionStatus: true,
        stripePriceId: true,
        stripeSubscriptionId: true,
        stripeCustomerId: true,
        trialStartDate: true,
        trialEndDate: true,
        currentPeriodEnd: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const billingPlan = resolveBillingPlan(userData);

    if (isLifetimeUser(userData) && userData.subscriptionStatus !== 'ACTIVE') {
      await prisma.user.update({
        where: { id: userData.id },
        data: {
          subscriptionStatus: 'ACTIVE',
          stripeSubscriptionId: null,
          currentPeriodEnd: null,
        },
      });
    }

    const publicUserData = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      subscriptionStatus: resolveEffectiveSubscriptionStatus(userData),
      trialStartDate: userData.trialStartDate,
      trialEndDate: userData.trialEndDate,
      currentPeriodEnd: userData.currentPeriodEnd,
      stripeCustomerId: userData.stripeCustomerId,
      billingPlan,
    };
    return NextResponse.json(publicUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 
