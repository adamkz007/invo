// Plan limits and utility functions - separated from Stripe SDK to reduce bundle size

// Duration of trial in days
export const TRIAL_DURATION_DAYS = 14;

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
} as const;

// Check if user's trial has expired
export function hasTrialExpired(trialEndDate: Date | null | undefined): boolean {
  if (!trialEndDate) return false;
  const now = new Date();
  return now > trialEndDate;
}

type PlanLimitTier = keyof typeof PLAN_LIMITS;

function resolvePlanLimitTier(subscriptionStatus: string): PlanLimitTier {
  const normalizedStatus = subscriptionStatus.toUpperCase();

  if (normalizedStatus === 'ACTIVE') {
    return 'PREMIUM';
  }

  if (normalizedStatus === 'TRIAL') {
    return 'TRIAL';
  }

  return 'FREE';
}

// Check if a user has reached their limit for customers or invoices
export function hasReachedLimit(
  subscriptionStatus: string,
  resourceType: 'customers' | 'invoicesPerMonth',
  currentCount: number
): boolean {
  const planType = resolvePlanLimitTier(subscriptionStatus);
  const limit = PLAN_LIMITS[planType][resourceType];
  return currentCount >= limit;
}

// Calculate trial end date based on trial duration
export function calculateTrialEndDate(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
  return endDate;
}
