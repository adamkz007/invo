import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TRIAL_DURATION_DAYS } from '@/lib/plan-limits';
import { useToast } from '@/components/ui/toast';
import { useSearchParams } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogClose
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { CheckCircle } from 'lucide-react';
import { normalizeSubscriptionPlan, type SubscriptionPlanKey } from '@/lib/subscription-plans';

interface SubscriptionSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    trialStartDate?: Date | string | null;
    trialEndDate?: Date | string | null;
    subscriptionStatus?: string;
    currentPeriodEnd?: Date | string | null;
    billingPlan?: SubscriptionPlanKey;
  };
  onSubscriptionChange?: () => void;
}

const PLAN_FEATURES = {
  FREE: [
    { name: 'Limited to 5 customers', included: true },
    { name: 'Limited to 15 invoices/month', included: true }
  ],
  PREMIUM: [
    { name: 'Unlimited customers', included: true },
    { name: 'Unlimited invoices', included: true }
  ],
  TRIAL: [
    { name: 'Unlimited customers', included: true },
    { name: 'Unlimited invoices', included: true },
    { name: `${TRIAL_DURATION_DAYS}-day free trial`, included: true }
  ],
};

// Helper function to safely parse dates
function parseDate(dateInput: Date | string | null | undefined): Date | null {
  if (!dateInput) return null;
  try {
    return dateInput instanceof Date ? dateInput : new Date(dateInput);
  } catch (e) {
    console.error("Error parsing date:", e);
    return null;
  }
}

// Helper to safely format dates
function formatDate(date: Date | null): string {
  if (!date) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", e);
    return 'N/A';
  }
}

export function SubscriptionSettings({ user, onSubscriptionChange }: SubscriptionSettingsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlanKey | null>(null);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | undefined>(user?.subscriptionStatus);
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  const [pendingCheckoutPlan, setPendingCheckoutPlan] = useState<SubscriptionPlanKey>('PRO_MONTHLY');
  
  console.log('SubscriptionSettings - Initial render with user:', user);
  console.log('SubscriptionSettings - subscriptionStatus:', user?.subscriptionStatus);
  
  useEffect(() => {
    // Always update subscription status from props
    setSubscriptionStatus(user?.subscriptionStatus);
    console.log('SubscriptionSettings - Updated from props:', user?.subscriptionStatus);
  }, [user?.subscriptionStatus]);

  useEffect(() => {
    const success = searchParams.get('success');
    const trial = searchParams.get('trial');
    const demo = searchParams.get('demo');
    const completedPlan = normalizeSubscriptionPlan(searchParams.get('plan'));
    
    if (success === 'true') {
      if (trial === 'true') {
        showToast({
          message: `Pro trial activated! You now have ${TRIAL_DURATION_DAYS} days of unlimited features.`,
          variant: 'success'
        });
        
        // Trigger refresh to get updated data from server
        if (onSubscriptionChange) {
          onSubscriptionChange();
        }
      } else if (completedPlan === 'LIFETIME') {
        showToast({
          message: 'Lifetime plan activated! You now have Pro features forever.',
          variant: 'success'
        });
      } else if (demo === 'true') {
        showToast({
          message: 'Premium upgrade successful! You now have access to all premium features.',
          variant: 'success'
        });
      }

      if (demo === 'true' && user) {
        setSubscriptionStatus('ACTIVE');
        user.subscriptionStatus = 'ACTIVE';
        if (completedPlan === 'LIFETIME') {
          user.billingPlan = 'LIFETIME';
          user.currentPeriodEnd = null;
        } else if (!user.currentPeriodEnd) {
          const oneMonthFromNow = new Date();
          oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
          user.currentPeriodEnd = oneMonthFromNow;
        }
      }
    }
  }, [searchParams, showToast, user, onSubscriptionChange]);

  const trialStartDate = parseDate(user?.trialStartDate);
  const trialEndDateFromDB = parseDate(user?.trialEndDate);
  const currentPeriodEnd = parseDate(user?.currentPeriodEnd);
  
  const trialEndDate = trialEndDateFromDB || (trialStartDate ? new Date(trialStartDate.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000) : null);
  
  // Handle case sensitivity in subscription status
  const normalizedStatus = subscriptionStatus?.toUpperCase();
  const isInTrial = normalizedStatus === 'TRIAL' && trialStartDate && trialEndDate && new Date() < trialEndDate;
  const isSubscribed = normalizedStatus === 'ACTIVE';
  const isLifetimePlan = isSubscribed && user?.billingPlan === 'LIFETIME';
  
  const planType = isSubscribed ? 'PREMIUM' : isInTrial ? 'TRIAL' : 'FREE';
  
  const features = PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES];
  
  const startCheckout = async (plan: SubscriptionPlanKey) => {
    setLoadingPlan(plan);
    setIsLoading(true);
    
    try {
      const returnUrl = `${window.location.origin}/settings`;
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, returnUrl }),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = (errorData as { error?: string } | null)?.error || 'Failed to create checkout session';
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      if (!data?.url || typeof data.url !== 'string') {
        throw new Error('Stripe checkout URL is missing from server response.');
      }
      
      // Checkout will redirect, so trigger refresh on return
      if (onSubscriptionChange) {
        // We'll refresh when we come back from Stripe
        sessionStorage.setItem('refresh_subscription', 'true');
      }
      
      window.location.assign(data.url);
    } catch (err) {
      console.error('Checkout error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Stripe payment processing failed. Please try again later.';
      showToast({
        message: errorMessage,
        variant: 'error'
      });
    } finally {
      setLoadingPlan(null);
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan: SubscriptionPlanKey) => {
    if (user?.email?.endsWith('@example.com')) {
      setPendingCheckoutPlan(plan);
      setEmailInput(user.email);
      setShowEmailDialog(true);
      return;
    }

    await startCheckout(plan);
  };

  // Add an effect to check for post-redirect refresh
  useEffect(() => {
    const shouldRefresh = sessionStorage.getItem('refresh_subscription');
    if (shouldRefresh) {
      sessionStorage.removeItem('refresh_subscription');
      if (onSubscriptionChange) {
        onSubscriptionChange();
      }
    }
  }, [onSubscriptionChange]);

  const handleManageSubscription = async () => {
    setIsPortalLoading(true);
    
    try {
      const response = await fetch('/api/subscription/customer-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to access customer portal');
      }
      
      const data = await response.json();
      
      window.location.href = data.url;
    } catch (err) {
      console.error('Customer portal error:', err);
      showToast({
        message: 'Failed to access subscription management. If this continues, you may need to cancel your subscription and try again.',
        variant: 'error'
      });
    } finally {
      setIsPortalLoading(false);
    }
  };
  
  const handleEmailSubmit = async () => {
    if (!emailInput || !emailInput.trim()) {
      showToast({
        message: 'Please enter a valid email address',
        variant: 'error'
      });
      return;
    }
    
    try {
      const response = await fetch('/api/user/update-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update email');
      }
      
      user.email = emailInput;
      
      setShowEmailDialog(false);

      await startCheckout(pendingCheckoutPlan);
      
    } catch (error) {
      console.error('Error updating email:', error);
      showToast({
        message: 'Failed to update email. Please try again.',
        variant: 'error'
      });
    }
  };
  
  const plan = isSubscribed ? (
    isLifetimePlan
      ? { name: 'Lifetime Plan', price: 'RM269 one-time' }
      : { name: 'Premium Plan', price: 'RM9/month' }
  ) : isInTrial ? {
    name: 'Pro Trial',
    price: `Free for ${TRIAL_DURATION_DAYS} days`
  } : {
    name: 'Free Plan',
    price: 'Free'
  };

  const canManageSubscription = isSubscribed && !isLifetimePlan;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Subscription
            {isInTrial && <Badge className="bg-blue-500">Trial</Badge>}
            {isLifetimePlan && <Badge className="bg-amber-500 text-amber-950">Lifetime</Badge>}
            {isSubscribed && !isLifetimePlan && <Badge className="bg-green-500">Premium</Badge>}
            {!isInTrial && !isSubscribed && <Badge>Free</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-lg">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.price}</p>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Features:</h4>
              <ul className="mt-4 space-y-2">
                {features.map((feature, index) => (
                  <li key={index} className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-sm">{feature.name}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {isInTrial && (
              <div className="text-sm space-y-2 p-3 bg-blue-50 dark:bg-blue-950 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-blue-700 dark:text-blue-300">Pro Trial</p>
                  <p className="font-medium text-blue-700 dark:text-blue-300">Valid until: {formatDate(trialEndDate)}</p>
                </div>
              </div>
            )}
            
            {isLifetimePlan && (
              <div className="text-sm space-y-2 p-3 bg-amber-50 dark:bg-amber-950 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-amber-700 dark:text-amber-300">Lifetime Plan</p>
                  <Badge className="bg-amber-500 text-amber-950">Limited-time offer</Badge>
                </div>
                <p>You have permanent Pro access with no recurring charges.</p>
              </div>
            )}

            {isSubscribed && !isLifetimePlan && currentPeriodEnd && (
              <div className="text-sm space-y-2 p-3 bg-green-50 dark:bg-green-950 rounded-md">
                <div className="flex justify-between items-center">
                  <p className="font-medium text-green-700 dark:text-green-300">Premium Plan</p>
                  <p className="font-medium text-green-700 dark:text-green-300">Valid until: {formatDate(currentPeriodEnd)}</p>
                </div>
                <p>Enjoy <span className="font-medium">unlimited customers</span> and <span className="font-medium">unlimited invoices</span> with your premium subscription.</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-3">
          {!isSubscribed && (
            <>
              <Button onClick={() => handleUpgrade('PRO_MONTHLY')} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingPlan === 'PRO_MONTHLY' ? 'Starting Pro checkout...' : 'Processing...'}
                  </>
                ) : (
                  'Upgrade to Pro (RM9/month)'
                )}
              </Button>

              <Button
                onClick={() => handleUpgrade('LIFETIME')}
                disabled={isLoading}
                variant="outline"
                className="w-full border-amber-300 hover:border-amber-400 hover:bg-amber-50/60 dark:hover:bg-amber-950/30"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {loadingPlan === 'LIFETIME' ? 'Starting Lifetime checkout...' : 'Processing...'}
                  </>
                ) : (
                  <div className="flex items-center justify-center gap-2">
                    <span>Lifetime (RM269 one-time)</span>
                    <Badge className="bg-amber-500 text-amber-950">Limited time</Badge>
                  </div>
                )}
              </Button>
            </>
          )}
          
          {canManageSubscription && (
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={handleManageSubscription}
              disabled={isPortalLoading}
            >
              {isPortalLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading portal...
                </>
              ) : (
                'Manage Subscription'
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
      
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Email Address</DialogTitle>
            <DialogDescription>
              An email address is required for subscription management and invoicing purposes.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
              />
            </div>
          </div>
          
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={handleEmailSubmit}>Continue to Checkout</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
