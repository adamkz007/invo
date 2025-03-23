import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { calculateTrialEndDate, TRIAL_DURATION_DAYS } from '@/lib/stripe';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the complete user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // If user is already in trial or active status, just return success without updating
    if (userData.subscriptionStatus === 'TRIAL' || userData.subscriptionStatus === 'ACTIVE') {
      console.log('User already has active subscription or trial:', userData.subscriptionStatus);
      return NextResponse.json({ 
        success: true, 
        message: 'User already has beta features activated',
        redirectUrl: '/settings?success=true&trial=true',
        user: {
          id: userData.id,
          subscriptionStatus: userData.subscriptionStatus,
          trialEndDate: userData.trialEndDate,
          currentPeriodEnd: userData.currentPeriodEnd
        }
      });
    }

    // Set trial dates - ensure 100 days trial period
    const now = new Date();
    const trialEndDate = calculateTrialEndDate(now); // Already using TRIAL_DURATION_DAYS (100)

    try {
      // Update the user to TRIAL status with 100 days expiration
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { 
          subscriptionStatus: 'TRIAL',
          trialStartDate: now,
          trialEndDate: trialEndDate
        },
        select: {
          id: true,
          subscriptionStatus: true,
          trialStartDate: true,
          trialEndDate: true
        }
      });

      console.log('User converted to trial status as beta tester:', user.id);
      console.log(`Trial period: ${TRIAL_DURATION_DAYS} days, ending on:`, trialEndDate);
      
      // Return success response with user data
      return NextResponse.json({ 
        success: true, 
        message: `Successfully activated beta features for ${TRIAL_DURATION_DAYS} days with unlimited customers and invoices`,
        redirectUrl: '/settings?success=true&trial=true',
        user: updatedUser
      });
    } catch (dbError) {
      console.error('Database error during trial conversion:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error processing beta upgrade:', error);
    return NextResponse.json(
      { error: 'Failed to process beta upgrade request' },
      { status: 500 }
    );
  }
} 