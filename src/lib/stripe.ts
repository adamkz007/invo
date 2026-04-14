import Stripe from 'stripe';
import { normalizeSubscriptionPlan, type SubscriptionPlanKey } from './subscription-plans';

// Re-export plan limits from separate file to allow importing without Stripe SDK
export {
  PLAN_LIMITS,
  TRIAL_DURATION_DAYS,
  hasTrialExpired,
  hasReachedLimit,
  calculateTrialEndDate
} from './plan-limits';

// Check if we're on the server side before initializing Stripe
const isServer = typeof window === 'undefined';

// Validate Stripe API key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
if (isServer && (!stripeSecretKey || stripeSecretKey.includes('your_stripe_secret_key'))) {
  console.warn('⚠️ Stripe API key is missing or invalid. Set a valid STRIPE_SECRET_KEY in your environment variables.');
}

// Initialize Stripe only on the server side with proper error handling
export const stripe = isServer && stripeSecretKey && !stripeSecretKey.includes('your_stripe_secret_key')
  ? new Stripe(stripeSecretKey)
  : null;

// Log Stripe mode for debugging
if (isServer && stripe) {
  const mode = stripeSecretKey?.startsWith('sk_live_') ? 'LIVE MODE' : 'TEST MODE';
  console.log(`Stripe initialized in ${mode}`);
}

// Constants
export const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || '';
export const STRIPE_LIFETIME_PRICE_ID = process.env.STRIPE_LIFETIME_PRICE_ID || '';

export function getStripePriceIdForPlan(plan: SubscriptionPlanKey): string {
  return plan === 'LIFETIME' ? STRIPE_LIFETIME_PRICE_ID : STRIPE_PRICE_ID;
}

// Create a Stripe customer for a user
export async function createStripeCustomer(email: string, name: string) {
  if (!stripe) {
    if (isServer) {
      throw new Error('Stripe is not properly configured. Check your environment variables.');
    } else {
      throw new Error('Stripe can only be used on the server side');
    }
  }
  
  const customer = await stripe.customers.create({
    email,
    name,
    metadata: {
      userId: email,
    },
  });
  
  return customer.id;
}

// Create a checkout session for subscription or one-time lifetime payment
export async function createCheckoutSession(
  customerId: string,
  plan: SubscriptionPlanKey,
  returnUrl: string,
  email?: string,
  userId?: string
) {
  if (!stripe) {
    if (isServer) {
      throw new Error('Stripe is not properly configured. Check your environment variables.');
    } else {
      throw new Error('Stripe can only be used on the server side');
    }
  }
  
  const normalizedPlan = normalizeSubscriptionPlan(plan);
  const priceId = getStripePriceIdForPlan(normalizedPlan);
  const isLifetimePlan = normalizedPlan === 'LIFETIME';

  if (!priceId || priceId.includes('your_stripe_price_id')) {
    const missingVar = isLifetimePlan ? 'STRIPE_LIFETIME_PRICE_ID' : 'STRIPE_PRICE_ID';
    throw new Error(`Invalid Stripe Price ID. Set a valid ${missingVar} in your environment variables.`);
  }
  
  // Create a checkout session with optional customer email
  const sessionConfig: Stripe.Checkout.SessionCreateParams = {
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: isLifetimePlan ? 'payment' : 'subscription',
    metadata: {
      plan: normalizedPlan,
      userId: userId || '',
      priceId,
    },
    billing_address_collection: 'auto',
    payment_method_collection: 'always',
    success_url: `${returnUrl}?success=true&plan=${normalizedPlan}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
  };

  if (!isLifetimePlan) {
    sessionConfig.subscription_data = {
      metadata: {
        plan: normalizedPlan,
        userId: userId || '',
      },
    };
  }
  
  // Use customer ID parameter (preferred) or email, but not both
  if (customerId) {
    sessionConfig.customer = customerId;
  } else if (email) {
    sessionConfig.customer_email = email;
  }
  
  const session = await stripe.checkout.sessions.create(sessionConfig);

  return session.url;
}

// Cancel a subscription
export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) {
    if (isServer) {
      throw new Error('Stripe is not properly configured. Check your environment variables.');
    } else {
      throw new Error('Stripe can only be used on the server side');
    }
  }
  return stripe.subscriptions.cancel(subscriptionId);
}

// Get subscription details
export async function getSubscription(subscriptionId: string) {
  if (!stripe) {
    if (isServer) {
      throw new Error('Stripe is not properly configured. Check your environment variables.');
    } else {
      throw new Error('Stripe can only be used on the server side');
    }
  }
  return stripe.subscriptions.retrieve(subscriptionId);
}

// Create a customer portal session
export async function createCustomerPortalSession(customerId: string, returnUrl: string) {
  if (!stripe) {
    if (isServer) {
      throw new Error('Stripe is not properly configured. Check your environment variables.');
    } else {
      throw new Error('Stripe can only be used on the server side');
    }
  }
  
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });
  
  return session.url;
}

 
