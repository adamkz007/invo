import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { LoginFormValues } from '@/types';
import { useRouter } from 'next/navigation';
import { TACInput } from '@/components/ui/tac-input';
import { InlineLoading } from '@/components/ui/loading';

const formSchema = z.object({
  tac: z.string().length(6, 'Authentication code must be 6 digits'),
});

interface LoginVerificationFormProps {
  phoneNumber: string;
  onBack: () => void;
}

export default function LoginVerificationForm({ phoneNumber, onBack }: LoginVerificationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<{ tac: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tac: '',
    },
  });

  async function onSubmit(values: { tac: string }) {
    setIsLoading(true);
    setError(null);

    try {
      const loginData: LoginFormValues = {
        phoneNumber,
        tac: values.tac,
      };

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Authentication failed');
      }

      router.push('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Verify Your Identity</h2>
        <p className="text-sm text-muted-foreground mt-2">
          Enter the verification code sent to {phoneNumber}
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="tac"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Authentication Code</FormLabel>
                <FormControl>
                  <TACInput
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isLoading}
                    className="mx-auto"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {error && <div className="text-sm text-red-500">{error}</div>}

          <div className="flex flex-col space-y-2">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <InlineLoading text="Verifying..." className="text-white" /> : 'Verify and Login'}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={onBack}
              disabled={isLoading}
            >
              Back
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
