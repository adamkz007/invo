'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { CustomerWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import { PhoneInput } from '@/components/ui/phone-input';
import { InlineLoading } from '@/components/ui/loading';

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

// Form validation schema
const customerFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phoneNumber: z.string()
    .min(4, { message: 'Phone number is required' })
    .refine(
      (val) => isValidMalaysiaPhoneNumber(val),
      { message: 'Please enter a valid Malaysian phone number (e.g. +60123456789)' }
    ),
  notes: z.string().optional().or(z.literal('')),
  userId: z.string().optional(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormProps {
  defaultValues?: CustomerFormValues;
  isEditing?: boolean;
  customerId?: string;
}

export default function CustomerForm({ defaultValues, isEditing = false, customerId }: CustomerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  // Initialize form with default values or empty customer
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: defaultValues || {
      name: '',
      email: '',
      phoneNumber: '',
      notes: '',
      userId: '',
    },
  });

  // Handle form submission
  async function onSubmit(values: CustomerFormValues) {
    setIsSubmitting(true);
    
    try {
      const endpoint = isEditing && customerId 
        ? `/api/customers/${customerId}` 
        : '/api/customers';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (response.status === 409) {
        // Handle duplicate phone number error
        const data = await response.json();
        if (data.duplicatePhone) {
          form.setError("phoneNumber", {
            type: "manual",
            message: "This phone number is already used by another customer"
          });
          showToast({
            message: 'A customer with this phone number already exists',
            variant: 'error',
          });
          return;
        }
      }
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} customer`);
      }
      
      const data = await response.json();
      
      showToast({
        message: isEditing ? 'Customer updated successfully!' : 'Customer created successfully!',
        variant: 'success',
      });
      
      router.push('/customers');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast({
        message: `Failed to ${isEditing ? 'update' : 'create'} customer. Please try again.`,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="mb-4 text-sm text-muted-foreground">
          Fields marked with <span className="text-red-500">*</span> are required.
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter customer name"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Company or individual name
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="customer@example.com"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Primary contact email address
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Phone Number */}
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <PhoneInput
                    placeholder="Enter phone number"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormDescription>
                  Malaysian mobile phone number
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Address fields are now handled separately in the database */}
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Add any additional information about this customer"
                  rows={4}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Payment terms, preferences, or other information
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/customers')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? <InlineLoading text="Saving..." />
              : isEditing
              ? 'Update Customer'
              : 'Create Customer'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
