'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { PhoneInput } from '@/components/ui/phone-input';

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

const customerFormSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }).optional().or(z.literal('')),
  phoneNumber: z.string()
    .min(4, { message: 'Phone number is required' })
    .refine(
      (val) => isValidMalaysiaPhoneNumber(val),
      { message: 'Please enter a valid Malaysian phone number (e.g. +60123456789)' }
    ),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  userId: z.string(),
});

type CustomerFormValues = z.infer<typeof customerFormSchema>;

interface CustomerFormDialogProps {
  userId: string;
  onCustomerCreated: (customer: any) => void;
  renderWithoutDialog?: boolean;
}

export default function CustomerFormDialog({ 
  userId, 
  onCustomerCreated, 
  renderWithoutDialog = false 
}: CustomerFormDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const { showToast } = useToast();

  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(customerFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
      notes: '',
      userId,
    },
  });

  async function onSubmit(values: CustomerFormValues) {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
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
          setIsSubmitting(false);
          return;
        }
      }

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const newCustomer = await response.json();
      onCustomerCreated(newCustomer);
      setOpen(false);
      form.reset();
      showToast({
        message: 'Customer created successfully',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error creating customer:', error);
      showToast({
        message: 'Failed to create customer. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (renderWithoutDialog) {
    return (
      <Form {...form}>
        <form onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation(); // Stop the event from bubbling up to parent forms
          form.handleSubmit(onSubmit)(e);
        }} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <Input placeholder="Customer name" {...field} />
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
                <FormLabel>Email (optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Email address" {...field} />
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
                <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                <FormControl>
                  <PhoneInput placeholder="Phone number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Customer address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Additional notes" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </form>
      </Form>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1 rounded-full w-8 p-0">
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only">Add Customer</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
          <DialogDescription>
            Create a new customer to add to your invoices. Only Name and Phone Number are required.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation(); // Stop the event from bubbling up to parent forms
            form.handleSubmit(onSubmit)(e);
          }} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <Input placeholder="Customer name" {...field} />
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
                  <FormLabel>Email (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Email address" {...field} />
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
                  <FormLabel>Phone Number <span className="text-red-500">*</span></FormLabel>
                  <FormControl>
                    <PhoneInput placeholder="Phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Customer address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Additional notes" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Creating...' : 'Create Customer'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 