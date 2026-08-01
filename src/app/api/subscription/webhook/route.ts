import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import Stripe from 'stripe';
import { normalizeSubscriptionPlan } from '@/lib/subscription-plans';

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

async function isProcessedEvent(eventId: string): Promise<boolean> {
  const existing = await prisma.processedWebhookEvent.findUnique({
    where: { eventId },
  });
  return Boolean(existing);
}

async function markEventProcessed(eventId: string): Promise<void> {
  await prisma.processedWebhookEvent.create({
    data: { eventId },
  });
}

export async function POST(req: NextRequest) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 });
  }

  const payload = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(payload, signature, endpointSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'verification failed';
    console.error(`Webhook signature verification failed: ${message}`);
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  if (await isProcessedEvent(event.id)) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const customerId = session.customer as string | null;

      if (!customerId) {
        break;
      }

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

        const user = await prisma.user.findFirst({
          where: {
            stripeCustomerId: customerId,
          },
        });

        if (user) {
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

      const user = await prisma.user.findFirst({
        where: {
          stripeSubscriptionId: subscription.id,
        },
      });

      if (user) {
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

  await markEventProcessed(event.id);
  return NextResponse.json({ received: true });
}
