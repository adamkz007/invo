import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';

// This is your Stripe webhook secret for testing
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
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
      
      // Get the subscription details
      if (session.subscription && session.customer) {
        const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
        const customerId = session.customer as string;

        // Find the user with the stripeCustomerId
        const user = await prisma.user.findFirst({
          where: {
            stripeCustomerId: customerId,
          },
        });

        if (user) {
          // Update user subscription details
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