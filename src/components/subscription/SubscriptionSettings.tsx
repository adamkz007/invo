import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateTrialEndDate, hasTrialExpired, TRIAL_DURATION_DAYS, PLAN_LIMITS } from '@/lib/stripe';
import { format } from 'date-fns';
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

interface SubscriptionSettingsProps {
  user: {
    id: string;
    name: string;
    email: string;
    trialStartDate?: Date | string | null;
    trialEndDate?: Date | string | null;
    subscriptionStatus?: string;
    currentPeriodEnd?: Date | string | null;
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
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  const [isBetaLoading, setIsBetaLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string | undefined>(user?.subscriptionStatus);
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailInput, setEmailInput] = useState(user?.email || '');
  
  console.log('SubscriptionSettings - Initial render with user:', user);
  console.log('SubscriptionSettings - subscriptionStatus:', user?.subscriptionStatus);
  
  useEffect(() => {
    // Always update subscription status from props
    setSubscriptionStatus(user?.subscriptionStatus);
    console.log('SubscriptionSettings - Updated from props:', user?.subscriptionStatus);
  }, [user?.subscriptionStatus]);

  useEffect(() => {
    const success = searchParams.get('success');
    const beta = searchParams.get('beta');
    const trial = searchParams.get('trial');
    const demo = searchParams.get('demo');
    
    if (success === 'true') {
      if (trial === 'true') {
        showToast({
          message: `Beta access activated! You now have ${TRIAL_DURATION_DAYS} days of unlimited features.`,
          variant: 'success'
        });
        
        // Trigger refresh to get updated data from server
        if (onSubscriptionChange) {
          onSubscriptionChange();
        }
      } else if (beta === 'true') {
        showToast({
          message: 'Beta upgrade successful! You now have premium features.',
          variant: 'success'
        });
      } else if (demo === 'true') {
        showToast({
          message: 'Premium upgrade successful! You now have access to all premium features.',
          variant: 'success'
        });
        
        if (user) {
          setSubscriptionStatus('active');
          user.subscriptionStatus = 'active';
          if (!user.currentPeriodEnd) {
            const oneMonthFromNow = new Date();
            oneMonthFromNow.setMonth(oneMonthFromNow.getMonth() + 1);
            user.currentPeriodEnd = oneMonthFromNow;
          }
        }
      }
    }
  }, [searchParams, showToast, user]);

  const trialStartDate = parseDate(user?.trialStartDate);
  const trialEndDateFromDB = parseDate(user?.trialEndDate);
  const currentPeriodEnd = parseDate(user?.currentPeriodEnd);
  
  const trialEndDate = trialEndDateFromDB || (trialStartDate ? new Date(trialStartDate.getTime() + TRIAL_DURATION_DAYS * 24 * 60 * 60 * 1000) : null);
  
  // Handle case sensitivity in subscription status
  const normalizedStatus = subscriptionStatus?.toUpperCase();
  const isInTrial = normalizedStatus === 'TRIAL' && trialStartDate && trialEndDate && new Date() < trialEndDate;
  const isSubscribed = normalizedStatus === 'ACTIVE';
  const trialExpired = normalizedStatus === 'TRIAL' && trialStartDate && trialEndDate && new Date() > trialEndDate;
  
  const planType = isSubscribed ? 'PREMIUM' : isInTrial ? 'TRIAL' : 'FREE';
  
  const features = PLAN_FEATURES[planType as keyof typeof PLAN_FEATURES];
  
  const handleUpgrade = async () => {
    if (user?.email?.endsWith('@example.com')) {
      setEmailInput(user.email);
      setShowEmailDialog(true);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }
      
      const data = await response.json();
      
      // Checkout will redirect, so trigger refresh on return
      if (onSubscriptionChange) {
        // We'll refresh when we come back from Stripe
        sessionStorage.setItem('refresh_subscription', 'true');
      }
      
      window.location.href = data.url;
    } catch (err) {
      console.error('Checkout error:', err);
      showToast({
        message: 'Stripe payment processing failed. Please try again later or consider cancelling your subscription request.',
        variant: 'error'
      });
    } finally {
      setIsLoading(false);
    }
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
      
      setIsLoading(true);
      
      try {
        const checkoutResponse = await fetch('/api/subscription/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        
        if (!checkoutResponse.ok) {
          throw new Error('Failed to create checkout session');
        }
        
        const data = await checkoutResponse.json();
        
        window.location.href = data.url;
      } catch (err) {
        console.error('Checkout error:', err);
        showToast({
          message: 'Failed to initiate checkout. Please try again.',
          variant: 'error'
        });
        setIsLoading(false);
      }
      
    } catch (error) {
      console.error('Error updating email:', error);
      showToast({
        message: 'Failed to update email. Please try again.',
        variant: 'error'
      });
    }
  };
  
  const plan = isSubscribed ? {
    name: 'Premium Plan',
    price: 'RM9/month'
  } : isInTrial ? {
    name: 'Beta Access',
    price: 'Free for now'
  } : {
    name: 'Free Plan',
    price: 'Free'
  };

  const handleBetaUpgrade = async () => {
    setIsBetaLoading(true);
    
    try {
      console.log('Initiating beta upgrade...');
      const response = await fetch('/api/subscription/beta-upgrade', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to process beta upgrade');
      }
      
      const data = await response.json();
      console.log('Beta upgrade response:', data);
      
      // Show success toast
      showToast({
        message: `Beta access activated! You now have ${TRIAL_DURATION_DAYS} days of unlimited features.`,
        variant: 'success'
      });
      
      // Update local state if user data is returned
      if (data.user) {
        // Update subscription status directly without a full page reload
        setSubscriptionStatus(data.user.subscriptionStatus);
        
        // Update the user object with new subscription details
        if (user) {
          user.subscriptionStatus = data.user.subscriptionStatus;
          user.trialStartDate = data.user.trialStartDate;
          user.trialEndDate = data.user.trialEndDate;
          
          // If onSubscriptionChange is provided, call it to update parent state
          if (onSubscriptionChange) {
            // Use setTimeout to prevent rapid state updates
            setTimeout(() => {
              onSubscriptionChange();
            }, 500);
          }
        }
      } else {
        // Fall back to redirect if no user data is returned
        window.location.href = data.redirectUrl;
      }
    } catch (err) {
      console.error('Beta upgrade error:', err);
      showToast({
        message: 'Failed to activate beta subscription. Please try again or contact support if this persists.',
        variant: 'error'
      });
    } finally {
      setIsBetaLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            Subscription
            {isInTrial && <Badge className="bg-blue-500">Trial</Badge>}
            {isSubscribed && <Badge className="bg-green-500">Premium</Badge>}
            {!isInTrial && !isSubscribed && <Badge>Free</Badge>}
          </CardTitle>
          <CardDescription>
            Manage your subscription and billing
          </CardDescription>
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
                  <p className="font-medium text-blue-700 dark:text-blue-300">Beta Access</p>
                  <p className="font-medium text-blue-700 dark:text-blue-300">Valid until: {formatDate(trialEndDate)}</p>
                </div>
              </div>
            )}
            
            {isSubscribed && currentPeriodEnd && (
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
              <Button onClick={handleUpgrade} disabled={isLoading} className="w-full">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Upgrade to Premium (RM9/month)'
                )}
              </Button>
              
              {!isInTrial && (
                <div className="w-full text-center">
                  <button 
                    onClick={handleBetaUpgrade} 
                    disabled={isBetaLoading}
                    className="text-xs text-primary hover:underline focus:outline-none"
                  >
                    {isBetaLoading ? (
                      <>
                        <Loader2 className="inline mr-1 h-3 w-3 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Beta tester? Click here to activate'
                    )}
                  </button>
                </div>
              )}
            </>
          )}
          
          {isSubscribed && (
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