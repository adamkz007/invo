import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { PhoneInput } from '@/components/ui/phone-input';

const formSchema = z.object({
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string().min(1, 'Password is required'),
});

type LoginPasswordFormValues = z.infer<typeof formSchema>;

interface LoginPasswordFormProps {
  initialPhoneNumber?: string;
}

export default function LoginPasswordForm({ initialPhoneNumber = '+60' }: LoginPasswordFormProps) {
  console.log('LoginPasswordForm render - initialPhoneNumber:', initialPhoneNumber);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<LoginPasswordFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: initialPhoneNumber || '+60', // Use initialPhoneNumber if provided
      password: '',
    },
  });
  
  useEffect(() => {
    console.log('LoginPasswordForm - Form values:', form.getValues());
  }, [form]);

  async function onSubmit(values: LoginPasswordFormValues) {
    console.log('LoginPasswordForm - onSubmit values:', values);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: values.phoneNumber,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      // Redirect to dashboard on successful login
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
      console.error('LoginPasswordForm - Error:', err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Welcome Back</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Login with your phone number and password
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
                  <PhoneInput
                    placeholder="Enter your phone number"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your password"
                    type="password"
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
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form>
      </Form>
    </div>
  );
} 