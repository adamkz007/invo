import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { RequestTACFormValues } from '@/types';
import { PhoneInput } from '@/components/ui/phone-input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle } from 'lucide-react';

// Malaysia phone number validation schema
const formSchema = z.object({
  phoneNumber: z
    .string()
    .refine(
      (value) => {
        // Must start with Malaysia country code +60
        if (!value.startsWith('+60')) {
          return false;
        }
        
        // Get the number without country code
        const numberWithoutCode = value.substring(3);
        
        // Check if it's a valid Malaysia mobile number
        // Malaysia mobile numbers start with 1 and are 9-10 digits after the country code
        return /^1\d{8,9}$/.test(numberWithoutCode);
      },
      {
        message: 'Please enter a valid Malaysia mobile number starting with +60',
      }
    ),
});

interface RequestTACFormProps {
  onSuccess: (phoneNumber: string) => void;
  isLogin?: boolean;
}

export default function RequestTACForm({ onSuccess, isLogin = true }: RequestTACFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInvalidPhoneWarning, setShowInvalidPhoneWarning] = useState(false);
  const [invalidPhone, setInvalidPhone] = useState('');

  const form = useForm<RequestTACFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '+60', // Default to Malaysia country code
    },
  });

  async function onSubmit(values: RequestTACFormValues) {
    // Additional validation before submission
    if (!isValidMalaysiaPhoneNumber(values.phoneNumber)) {
      setInvalidPhone(values.phoneNumber);
      setShowInvalidPhoneWarning(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/request-tac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to send authentication code');
      }

      // With automatic account creation, we no longer need to check if the user exists
      // Just log the status in console for debugging
      console.log(`User exists: ${data.data.userExists ? 'Yes' : 'No, will be auto-created'}`);

      // Call onSuccess callback with the phone number
      onSuccess(values.phoneNumber);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  // Malaysia-specific phone number validation
  function isValidMalaysiaPhoneNumber(phone: string): boolean {
    // Must start with Malaysia country code +60
    if (!phone.startsWith('+60')) {
      return false;
    }
    
    // Get the number without country code
    const numberWithoutCode = phone.substring(3);
    
    // Malaysia mobile numbers:
    // - Must start with 1
    // - Must be 9-10 digits after the country code
    // - Common prefixes: 10, 11, 12, 13, 14, 15, 16, 17, 18, 19
    return /^1[0-9]{8,9}$/.test(numberWithoutCode);
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isLogin ? 'Login to Your Account' : 'Create an Account'}
        </h2>
        
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>MY number</FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Enter your mobile number"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Request Verification Code'}
          </Button>
        </form>
      </Form>

      {/* Invalid Phone Warning Dialog */}
      <Dialog open={showInvalidPhoneWarning} onOpenChange={setShowInvalidPhoneWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Invalid Malaysia Mobile Number
            </DialogTitle>
          </DialogHeader>
          <div className="py-3">
            <p>The phone number <span className="font-semibold">{invalidPhone}</span> appears to be invalid.</p>
            <p className="mt-2">Please ensure:</p>
            <ul className="list-disc pl-5 mt-1 space-y-1 text-sm">
              <li>It starts with Malaysia country code (+60)</li>
              <li>It's followed by a mobile prefix starting with 1</li>
              <li>It has 9-10 digits after the country code</li>
              <li>Example: +60123456789</li>
            </ul>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowInvalidPhoneWarning(false)}>
              Try Again
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
