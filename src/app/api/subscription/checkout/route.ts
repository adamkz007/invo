import { NextRequest, NextResponse } from 'next/server';
import { createSubscription, createStripeCustomer, stripe, STRIPE_PRICE_ID } from '@/lib/stripe';
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
      where: { id: user.id }
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if user already has a Stripe customer ID
    let customerId = userData.stripeCustomerId;
    
    // Check for simulated customer ID (format cus_sim_*)
    if (customerId && customerId.startsWith('cus_sim_')) {
      console.log(`Detected simulated customer ID: ${customerId}. Using demo subscription flow.`);
      
      // For simulated customers, set the subscription status to active in the database
      try {
        // Calculate current period end (1 month from now)
        const currentPeriodEnd = new Date();
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
        
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            subscriptionStatus: 'active',
            stripeSubscriptionId: `sub_sim_${Date.now()}`,
            stripePriceId: STRIPE_PRICE_ID || 'price_sim_standard',
            currentPeriodEnd: currentPeriodEnd,
          }
        });
        console.log('Updated user with simulated subscription data:', user.id);
      } catch (error) {
        console.error('Error updating user with simulated subscription:', error);
        // Continue with the flow even if the database update fails
      }
      
      // Return a demo success URL instead of actual Stripe checkout
      const demoSuccessUrl = `${returnUrl}?success=true&demo=true&session_id=demo_session_${Date.now()}`;
      return NextResponse.json({ url: demoSuccessUrl });
    }
    
    // Check if Stripe is properly configured
    const isStripeConfigured = process.env.STRIPE_SECRET_KEY && 
                              (process.env.STRIPE_SECRET_KEY.startsWith('sk_live_') || 
                               process.env.STRIPE_SECRET_KEY.startsWith('sk_test_')) &&
                              process.env.STRIPE_PRICE_ID &&
                              !process.env.STRIPE_PRICE_ID.includes('your_stripe_price_id');

    if (!isStripeConfigured) {
      console.error('Stripe is not properly configured');
      return NextResponse.json({ error: 'Stripe is not properly configured' }, { status: 500 });
    }

    // If we don't have a customer ID, create a new one
    if (!customerId) {
      try {
        customerId = await createStripeCustomer(
          userData.email || `user-${userData.id}@example.com`,
          userData.name || `User ${userData.id}`
        );

        // Save the customer ID to the user record
        await prisma.user.update({
          where: { id: userData.id },
          data: { 
            stripeCustomerId: customerId
          }
        });
      } catch (error) {
        console.error('Error creating Stripe customer:', error);
        return NextResponse.json(
          { error: 'Failed to create Stripe customer' },
          { status: 500 }
        );
      }
    }

    // Create a checkout session
    let checkoutUrl;
    try {
      // Get the user's email, providing a fallback if null
      const userEmail = userData.email || `user-${userData.id}@example.com`;
      
      checkoutUrl = await createSubscription(
        customerId, 
        STRIPE_PRICE_ID, 
        returnUrl,
        userEmail
      );
    } catch (error) {
      console.error('Checkout error:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session. Please try again.' },
        { status: 500 }
      );
    }

    // Return the checkout URL
    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Error processing checkout:', error);
    return NextResponse.json(
      { error: 'Failed to process checkout request' },
      { status: 500 }
    );
  }
} 