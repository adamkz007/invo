export const SUBSCRIPTION_PLANS = {
  PRO_MONTHLY: {
    label: 'Pro (Monthly)',
    amountLabel: 'RM9/month',
    checkoutMode: 'subscription',
  },
  LIFETIME: {
    label: 'Lifetime',
    amountLabel: 'RM269 one-time',
    checkoutMode: 'payment',
  },
} as const;

export type SubscriptionPlanKey = keyof typeof SUBSCRIPTION_PLANS;

export const DEFAULT_SUBSCRIPTION_PLAN: SubscriptionPlanKey = 'PRO_MONTHLY';

export function normalizeSubscriptionPlan(input: unknown): SubscriptionPlanKey {
  if (input === 'LIFETIME') {
    return 'LIFETIME';
  }

  return DEFAULT_SUBSCRIPTION_PLAN;
}
