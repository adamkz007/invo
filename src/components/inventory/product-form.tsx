'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { ProductWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';

// Form validation schema
const productFormSchema = z.object({
  name: z.string().min(2, { message: 'Product name must be at least 2 characters' }),
  description: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, { message: 'Price must be a positive number' }),
  quantity: z.coerce.number().min(0, { message: 'Quantity must be a positive number' }),
  sku: z.string().min(3, { message: 'SKU must be at least 3 characters' }),
  disableStockManagement: z.boolean().default(false),
  userId: z.string().optional(),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  defaultValues?: ProductFormValues;
  isEditing?: boolean;
  productId?: string;
}

export default function ProductForm({ defaultValues, isEditing = false, productId }: ProductFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalInventoryValue, setTotalInventoryValue] = useState(0);
  const router = useRouter();
  const { showToast } = useToast();
  const { settings } = useSettings();
  const [quantityValue, setQuantityValue] = useState<string>(
    defaultValues ? defaultValues.quantity.toString() : "0"
  );

  // Initialize form with default values or empty product
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      price: 0,
      quantity: 0,
      sku: '',
      disableStockManagement: false,
      userId: '',
    },
  });

  // Fetch total inventory value
  useEffect(() => {
    async function fetchInventoryValue() {
      try {
        const response = await fetch('/api/dashboard');
        if (response.ok) {
          const data = await response.json();
          setTotalInventoryValue(data.inventoryValue || 0);
        }
      } catch (error) {
        console.error('Error fetching inventory value:', error);
      }
    }

    fetchInventoryValue();
  }, []);

  // Handle form submission
  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    
    try {
      const endpoint = isEditing && productId 
        ? `/api/products/${productId}` 
        : '/api/products';
      
      const method = isEditing ? 'PUT' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isEditing ? 'update' : 'create'} product`);
      }
      
      const data = await response.json();
      
      showToast({
        message: isEditing ? 'Product updated successfully!' : 'Product created successfully!',
        variant: 'success',
      });
      
      router.push('/inventory');
      router.refresh();
    } catch (error) {
      console.error('Error submitting form:', error);
      showToast({
        message: `Failed to ${isEditing ? 'update' : 'create'} product. Please try again.`,
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Generate SKU if creating a new product
  const generateSKU = () => {
    if (!isEditing) {
      const productName = form.watch('name');
      if (productName) {
        // Generate SKU based on product name (first 3 letters uppercase) + random number
        const prefix = productName.substring(0, 3).toUpperCase();
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        form.setValue('sku', `${prefix}-${randomNum}`);
      }
    }
  };

  // Watch for disableStockManagement changes
  const disableStockManagement = form.watch('disableStockManagement');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Display total inventory value */}
        <div className="bg-muted/50 p-4 rounded-lg mb-6">
          <h3 className="text-lg font-medium mb-2">Inventory Summary</h3>
          <div className="flex items-center justify-between">
            <span>Total Inventory Value:</span>
            <span className="font-bold">{formatCurrency(totalInventoryValue, settings)}</span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Product Name */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Product Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter product name"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (!isEditing && !form.watch('sku')) {
                        setTimeout(generateSKU, 500);
                      }
                    }}
                    disabled={isSubmitting || (isEditing && true)}
                  />
                </FormControl>
                <FormDescription>
                  Name of the product or service
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* SKU */}
          <FormField
            control={form.control}
            name="sku"
            render={({ field }) => (
              <FormItem>
                <FormLabel>SKU</FormLabel>
                <div className="flex space-x-2">
                  <FormControl>
                    <Input
                      placeholder="Enter SKU"
                      {...field}
                      disabled={isSubmitting || (isEditing && true)}
                    />
                  </FormControl>
                  {!isEditing && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={generateSKU}
                      disabled={isSubmitting}
                    >
                      Generate
                    </Button>
                  )}
                </div>
                <FormDescription>
                  Unique product identifier
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Price */}
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
                <FormDescription>
                  Unit price
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Quantity */}
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
                <FormDescription>
                  Current stock level
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Disable Stock Management */}
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
                  for service-based products or items that don&apos;t require inventory tracking
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter product description"
                  rows={4}
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Detailed information about the product or service
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/inventory')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : isEditing
              ? 'Update Product'
              : 'Create Product'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
