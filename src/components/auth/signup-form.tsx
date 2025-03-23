import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { SignUpFormValues } from '@/types';
import { PhoneInput } from '@/components/ui/phone-input';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[a-zA-Z]/, 'Password must contain at least one letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don&apos;t match",
  path: ['confirmPassword'],
});

export default function SignUpForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const form = useForm<SignUpFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '+60', // Default to Malaysia country code
      password: '',
      confirmPassword: '',
    },
  });

  // Calculate password strength
  useEffect(() => {
    const password = form.watch('password');
    if (!password) {
      setPasswordStrength(0);
      return;
    }
    
    let strength = 0;
    
    // Length check
    if (password.length >= 8) strength += 1;
    
    // Contains letters check
    if (/[a-zA-Z]/.test(password)) strength += 1;
    
    // Contains numbers check
    if (/[0-9]/.test(password)) strength += 1;
    
    // Contains special characters check
    if (/[^a-zA-Z0-9]/.test(password)) strength += 1;
    
    setPasswordStrength(strength);
  }, [form.watch('password')]);
  
  // Get the color for the strength indicator
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-slate-200';
    if (passwordStrength === 1) return 'bg-red-500';
    if (passwordStrength === 2) return 'bg-orange-500';
    if (passwordStrength === 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  // Get the label for the strength indicator
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return '';
    if (passwordStrength === 1) return 'Weak';
    if (passwordStrength === 2) return 'Fair';
    if (passwordStrength === 3) return 'Good';
    return 'Strong';
  };

  async function onSubmit(values: SignUpFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      // Register the user
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: values.name,
          email: values.email,
          phoneNumber: values.phoneNumber,
          password: values.password,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Registration failed');
      }

      // Automatically log the user in
      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
        }),
      });

      const loginData = await loginResponse.json();

      if (loginData.success) {
        // Redirect to the settings page to complete their profile
        router.push('/settings');
      } else {
        // If auto-login fails, redirect to login page with success message
        router.push('/login?status=signup_success');
      }

    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Create an Account</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Sign up to start using Invo for your invoicing needs
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your full name"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email address"
                    type="email"
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
                    placeholder="Create a password"
                    type="password"
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                {field.value && (
                  <div className="mt-2 space-y-1">
                    <div className="flex h-2 w-full space-x-1">
                      <div className={`h-full w-1/4 rounded-full ${passwordStrength >= 1 ? getStrengthColor() : 'bg-slate-200'}`}></div>
                      <div className={`h-full w-1/4 rounded-full ${passwordStrength >= 2 ? getStrengthColor() : 'bg-slate-200'}`}></div>
                      <div className={`h-full w-1/4 rounded-full ${passwordStrength >= 3 ? getStrengthColor() : 'bg-slate-200'}`}></div>
                      <div className={`h-full w-1/4 rounded-full ${passwordStrength >= 4 ? getStrengthColor() : 'bg-slate-200'}`}></div>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password strength: <span className="font-medium">{getStrengthLabel()}</span>
                    </p>
                    <ul className="text-xs text-muted-foreground list-disc pl-4">
                      <li className={field.value.length >= 8 ? "text-green-500" : ""}>
                        At least 8 characters
                      </li>
                      <li className={/[a-zA-Z]/.test(field.value) ? "text-green-500" : ""}>
                        Contains letters
                      </li>
                      <li className={/[0-9]/.test(field.value) ? "text-green-500" : ""}>
                        Contains numbers
                      </li>
                    </ul>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Confirm your password"
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
            {isLoading ? 'Signing up...' : 'Sign Up'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
