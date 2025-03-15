import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { RequestTACFormValues } from '@/types';

const formSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
});

interface RequestTACFormProps {
  onSuccess: (phoneNumber: string) => void;
  isLogin?: boolean;
}

export default function RequestTACForm({ onSuccess, isLogin = true }: RequestTACFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<RequestTACFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: '',
    },
  });

  async function onSubmit(values: RequestTACFormValues) {
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

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">
          {isLogin ? 'Login to Your Account' : 'Create an Account'}
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter your phone number to receive a verification code
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
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
    </div>
  );
}
