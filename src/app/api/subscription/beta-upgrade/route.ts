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

    // Set trial dates - ensure 100 days trial period
    const now = new Date();
    const trialEndDate = calculateTrialEndDate(now); // Already using TRIAL_DURATION_DAYS (100)

    try {
      // Update the user to TRIAL status with 100 days expiration
      await prisma.$queryRaw`
        UPDATE User 
        SET subscriptionStatus = 'TRIAL', 
            trialStartDate = ${now.toISOString()}, 
            trialEndDate = ${trialEndDate.toISOString()}
        WHERE id = ${user.id}
      `;

      // Also update with Prisma client to ensure proper case handling
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          subscriptionStatus: 'TRIAL',
          trialStartDate: now,
          trialEndDate: trialEndDate
        }
      });

      console.log('User converted to trial status as beta tester:', user.id);
      console.log(`Trial period: ${TRIAL_DURATION_DAYS} days, ending on:`, trialEndDate);
    } catch (dbError) {
      console.error('Database error during trial conversion:', dbError);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: `Successfully activated beta features for ${TRIAL_DURATION_DAYS} days with unlimited customers and invoices`,
      redirectUrl: '/settings?success=true&trial=true'
    });
  } catch (error) {
    console.error('Error processing beta upgrade:', error);
    return NextResponse.json(
      { error: 'Failed to process beta upgrade request' },
      { status: 500 }
    );
  }
} 