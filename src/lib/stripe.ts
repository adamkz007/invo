import Stripe from 'stripe';

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
if (isServer && (!STRIPE_PRICE_ID || STRIPE_PRICE_ID.includes('your_stripe_price_id'))) {
  console.warn('⚠️ Stripe Price ID is missing or invalid. Set a valid STRIPE_PRICE_ID in your environment variables.');
}

// Duration of trial in days
export const TRIAL_DURATION_DAYS = 100;

// Plan limits
export const PLAN_LIMITS = {
  FREE: {
    customers: 5,
    invoicesPerMonth: 15
  },
  PREMIUM: {
    customers: Infinity,
    invoicesPerMonth: Infinity
  },
  TRIAL: {
    customers: Infinity,
    invoicesPerMonth: Infinity
  }
};

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

// Create a subscription for a customer
export async function createSubscription(
  customerId: string,
  priceId: string = STRIPE_PRICE_ID,
  returnUrl: string,
  email?: string
) {
  if (!stripe) {
    if (isServer) {
      throw new Error('Stripe is not properly configured. Check your environment variables.');
    } else {
      throw new Error('Stripe can only be used on the server side');
    }
  }
  
  if (!priceId || priceId.includes('your_stripe_price_id')) {
    throw new Error('Invalid Stripe Price ID. Set a valid STRIPE_PRICE_ID in your environment variables.');
  }
  
  // Create a checkout session with optional customer email
  const sessionConfig: any = {
    payment_method_types: ['card'],
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: 'subscription',
    billing_address_collection: 'auto',
    payment_method_collection: 'always',
    success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${returnUrl}?canceled=true`,
  };
  
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

// Calculate trial end date based on trial duration
export function calculateTrialEndDate(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
  return endDate;
}

// Check if user's trial has expired
export function hasTrialExpired(trialEndDate: Date | null | undefined): boolean {
  if (!trialEndDate) return false; // If no end date set, assume trial hasn't expired
  const now = new Date();
  return now > trialEndDate;
}

// Check if a user has reached their limit for customers or invoices
export function hasReachedLimit(
  subscriptionStatus: string,
  resourceType: 'customers' | 'invoicesPerMonth',
  currentCount: number
): boolean {
  const planType = subscriptionStatus === 'ACTIVE' ? 'PREMIUM' : 
                  subscriptionStatus === 'TRIAL' ? 'TRIAL' : 'FREE';
  
  const limit = PLAN_LIMITS[planType as keyof typeof PLAN_LIMITS][resourceType];
  return currentCount >= limit;
} 