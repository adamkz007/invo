import {
  DEFAULT_SUBSCRIPTION_PLAN,
  type SubscriptionPlanKey,
} from './subscription-plans';

export type SubscriptionUserFields = {
  subscriptionStatus?: string | null;
  stripePriceId?: string | null;
  stripeSubscriptionId?: string | null;
};

const SIM_LIFETIME_PRICE_ID = 'price_sim_lifetime';

export function getConfiguredLifetimePriceId(): string {
  return process.env.STRIPE_LIFETIME_PRICE_ID?.trim() || '';
}

export function isLifetimePriceId(stripePriceId: string | null | undefined): boolean {
  if (!stripePriceId) {
    return false;
  }

  if (stripePriceId === SIM_LIFETIME_PRICE_ID) {
    return true;
  }

  const lifetimePriceId = getConfiguredLifetimePriceId();
  return Boolean(lifetimePriceId && stripePriceId === lifetimePriceId);
}

export function isLifetimeUser(user: SubscriptionUserFields): boolean {
  return isLifetimePriceId(user.stripePriceId);
}

export function resolveBillingPlan(user: SubscriptionUserFields): SubscriptionPlanKey {
  if (isLifetimeUser(user)) {
    return 'LIFETIME';
  }

  return DEFAULT_SUBSCRIPTION_PLAN;
}

export function normalizeSubscriptionStatus(status: string | null | undefined): string {
  return (status || 'FREE').toUpperCase();
}

export function isPremiumUser(user: SubscriptionUserFields): boolean {
  const status = normalizeSubscriptionStatus(user.subscriptionStatus);

  if (status === 'ACTIVE') {
    return true;
  }

  // Lifetime purchasers keep premium access even if status was downgraded.
  return isLifetimeUser(user);
}

export function resolveEffectiveSubscriptionStatus(user: SubscriptionUserFields): string {
  if (isPremiumUser(user)) {
    return 'ACTIVE';
  }

  const status = normalizeSubscriptionStatus(user.subscriptionStatus);
  if (status === 'TRIAL') {
    return 'TRIAL';
  }

  return 'FREE';
}

export function shouldExpireTrial(
  user: SubscriptionUserFields,
  trialExpired: boolean,
): boolean {
  return (
    trialExpired &&
    normalizeSubscriptionStatus(user.subscriptionStatus) === 'TRIAL' &&
    !isLifetimeUser(user)
  );
}

export function getSubscriptionUserSelect() {
  return {
    subscriptionStatus: true,
    stripePriceId: true,
    stripeSubscriptionId: true,
    trialEndDate: true,
  } as const;
}
