import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { normalizeSubscriptionPlan } from '@/lib/subscription-plans';

// This is your Stripe webhook secret for testing
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string | null;

      if (!customerId) {
        break;
      }

      // Find the user with the stripeCustomerId
      const user = await prisma.user.findFirst({
        where: {
          stripeCustomerId: customerId,
        },
      });

      if (!user) {
        break;
      }

      const planFromMetadata = normalizeSubscriptionPlan(session.metadata?.plan);
      const isLifetimeCheckout = session.mode === 'payment' || planFromMetadata === 'LIFETIME';
      
      // Lifetime one-time payment
      if (isLifetimeCheckout) {
        let paidPriceId = session.metadata?.priceId || null;

        try {
          const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 1 });
          paidPriceId = lineItems.data[0]?.price?.id || paidPriceId;
        } catch (error) {
          console.error('Failed to fetch line items for checkout session:', error);
        }

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            stripeSubscriptionId: null,
            stripePriceId: paidPriceId,
            currentPeriodEnd: null,
          },
        });
        break;
      }

      // Recurring subscription checkout
      if (session.subscription) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);

        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'ACTIVE',
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });
      }
      break;
    }

    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      if (invoice.subscription && invoice.customer) {
        const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
        const customerId = invoice.customer as string;

        // Find the user
        const user = await prisma.user.findFirst({
          where: {
            stripeCustomerId: customerId,
          },
        });

        if (user) {
          // Update subscription details
          await prisma.user.update({
            where: { id: user.id },
            data: {
              subscriptionStatus: 'ACTIVE',
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
        }
      }
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as Stripe.Subscription;
      
      // Find the user
      const user = await prisma.user.findFirst({
        where: {
          stripeSubscriptionId: subscription.id,
        },
      });

      if (user) {
        // Update user subscription status
        await prisma.user.update({
          where: { id: user.id },
          data: {
            subscriptionStatus: 'FREE',
            stripeSubscriptionId: null,
            currentPeriodEnd: null,
          },
        });
      }
      break;
    }

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
} 
