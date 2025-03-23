import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    console.log('API: /api/user/me called');
    
    // Get authenticated user from request
    const user = await getUserFromRequest(req);
    console.log('User from request:', user ? 'Found user' : 'No user found');
    
    if (!user) {
      console.log('API: Unauthorized - No user found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get complete user data from database
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    console.log('API: User data from database:', userData ? 'Found' : 'Not found');

    if (!userData) {
      console.log('API: User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data with subscription info, ensuring email is included
    const publicUserData = {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      phoneNumber: userData.phoneNumber,
      subscriptionStatus: userData.subscriptionStatus || 'FREE',
      trialStartDate: userData.trialStartDate,
      trialEndDate: userData.trialEndDate,
      currentPeriodEnd: userData.currentPeriodEnd,
      stripeCustomerId: userData.stripeCustomerId
    };

    console.log('API: Returning user data with subscription info');
    return NextResponse.json(publicUserData);
  } catch (error) {
    console.error('Error fetching user data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user data' },
      { status: 500 }
    );
  }
} 