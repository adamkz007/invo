// Plan limits and utility functions - separated from Stripe SDK to reduce bundle size

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
} as const;

// Check if user's trial has expired
export function hasTrialExpired(trialEndDate: Date | null | undefined): boolean {
  if (!trialEndDate) return false;
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

// Calculate trial end date based on trial duration
export function calculateTrialEndDate(startDate: Date = new Date()): Date {
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + TRIAL_DURATION_DAYS);
  return endDate;
}
