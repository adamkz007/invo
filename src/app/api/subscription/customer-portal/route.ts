import { NextRequest, NextResponse } from 'next/server';
import { createCustomerPortalSession } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const { returnUrl = `${process.env.NEXT_PUBLIC_APP_URL}/settings` } = await req.json();

    // Get the complete user data
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        email: true,
        name: true,
        stripeCustomerId: true
      }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user has a Stripe customer ID
    if (!userData.stripeCustomerId) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 400 });
    }

    // Check if Stripe is properly configured
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                              (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') || 
                               process.env.STRIPE_SECRET_KEY.startsWith('sk_test_'));

    if (!isStripeConfigured) {
      console.error('Stripe is not properly configured');
      return NextResponse.json({ error: 'Stripe is not properly configured' }, { status: 500 });
    }

    try {
      // Create a customer portal session
      const portalUrl = await createCustomerPortalSession(
        userData.stripeCustomerId,
        returnUrl
      );

      // Return the portal URL
      return NextResponse.json({ url: portalUrl });
    } catch (error) {
      console.error('Error creating customer portal session:', error);
      return NextResponse.json(
        { error: 'Failed to create customer portal session' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing customer portal request:', error);
    return NextResponse.json(
      { error: 'Failed to process customer portal request' },
      { status: 500 }
    );
  }
} 