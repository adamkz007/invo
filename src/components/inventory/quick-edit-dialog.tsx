'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/components/ui/toast';
import { ProductWithRelations } from '@/types';
import { useSettings } from '@/contexts/settings-context';

// Form validation schema
const quickEditSchema = z.object({
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
  quantity: z.coerce.number().min(0, { message: 'Quantity must be a positive number' }),
  disableStockManagement: z.boolean().default(false),
});

type QuickEditFormValues = z.infer<typeof quickEditSchema>;

interface QuickEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductWithRelations;
  onSave: (updatedProduct: Partial<ProductWithRelations>) => Promise<void>;
}

export function QuickEditDialog({ 
  open, 
  onOpenChange, 
  product, 
  onSave 
}: QuickEditDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [quantityValue, setQuantityValue] = useState<string>(product.quantity.toString());

  // Initialize form with product values
  const form = useForm<QuickEditFormValues>({
    resolver: zodResolver(quickEditSchema),
    defaultValues: {
      price: product.price,
      quantity: product.quantity,
      disableStockManagement: product.disableStockManagement,
    },
  });

  // Watch for disableStockManagement changes
  const disableStockManagement = form.watch('disableStockManagement');

  // Handle form submission
  async function onSubmit(values: QuickEditFormValues) {
    setIsSubmitting(true);
    
    try {
      await onSave(values);
      
      showToast({
        message: 'Product updated successfully!',
        variant: 'success',
      });
    } catch (error) {
      console.error('Error updating product:', error);
      showToast({
        message: 'Failed to update product. Please try again.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>
            Update price and quantity for &quot;{product.name}&quot;
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <Button
                        variant="outline"
                        className="rounded-r-none border-r-0"
                        disabled={true}
                      >
                        {settings.currency.code}
                      </Button>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="rounded-l-none"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="disableStockManagement"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={(checked) => {
                        field.onChange(checked);
                        if (checked) {
                          // If disabling stock management, set quantity to a high number
                          form.setValue('quantity', 999);
                          setQuantityValue('999');
                        }
                      }}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Disable Stock Management</FormLabel>
                    <FormDescription>
                      Enable for service-based products
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      step="1"
                      min="0"
                      value={quantityValue}
                      onChange={(e) => {
                        const value = e.target.value;
                        setQuantityValue(value);
                        field.onChange(value === '' ? 0 : parseInt(value, 10));
                      }}
                      onFocus={(e) => {
                        if (e.target.value === '0') {
                          setQuantityValue('');
                        }
                      }}
                      onBlur={(e) => {
                        if (e.target.value === '') {
                          setQuantityValue('0');
                        }
                      }}
                      className={quantityValue === '0' ? 'text-gray-400' : ''}
                      disabled={isSubmitting || disableStockManagement}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 