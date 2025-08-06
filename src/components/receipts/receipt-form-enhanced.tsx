'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Trash2, Plus } from 'lucide-react';
import { calculateInvoiceTotals, formatCurrency } from '@/lib/utils';
import { ProductWithRelations, ReceiptFormValues } from '@/types';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/components/ui/toast';
import ProductFormDialog from '@/components/products/product-form-dialog';
import { ReactDatePickerComponent } from '@/components/ui/react-date-picker';

// Form validation schema
const receiptFormSchema = z.object({
  customerPhone: z.string().optional(),
  customerName: z.string().optional(),
  receiptDate: z.coerce.date(),
  items: z.array(z.object({
    productId: z.string().min(1, { message: 'Please select a product' }),
    quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1' }),
    unitPrice: z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
    description: z.string().optional(),
  })).min(1, { message: 'Add at least one item' }),
  paymentMethod: z.enum(['CASH', 'CARD', 'OTHER']),
  notes: z.string().optional(),
  userId: z.string().optional(),
});

interface ReceiptFormProps {
  defaultValues?: ReceiptFormValues;
}

function ReceiptFormEnhanced({ defaultValues }: ReceiptFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  });
  
  const router = useRouter();
  const { settings } = useSettings();
  const { showToast } = useToast();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching products:', error);
        showToast({
          variant: "error",
          message: "Failed to load products. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [showToast]);

  // Initialize form with default values or new receipt values
  const form = useForm<ReceiptFormValues>({
    resolver: zodResolver(receiptFormSchema),
    defaultValues: defaultValues || {
      customerPhone: '',
      customerName: '',
      receiptDate: new Date(),
      paymentMethod: 'CASH',
      notes: '',
      items: [
        {
          productId: '',
          quantity: 1,
          unitPrice: 0,
          description: '',
        },
      ],
      userId: '',
    },
  });

  // Create field array for receipt items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Calculate totals whenever form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      const totals = calculateInvoiceTotals(
        values.items?.map(item => ({
          quantity: item?.quantity || 0,
          unitPrice: item?.unitPrice || 0,
        })) || [],
        0, // No tax for receipts
        0  // No discount for receipts
      );
      setTotals(totals);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  async function onSubmit(values: ReceiptFormValues) {
    setIsSubmitting(true);
    
    try {
      // Default to 'Walk-in Customer' if no customer name is provided
      if (!values.customerName) {
        values.customerName = 'Walk-in Customer';
      }

      // Add calculated total to the form values
      const receiptData = {
        ...values,
        total: totals.total
      };
      
      // Debug log
      console.log('Submitting receipt data:', receiptData);
      
      // Submit to the API
      const response = await fetch('/api/receipts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-receipts-module-enabled': settings.enableReceiptsModule ? 'true' : 'false'
        },
        body: JSON.stringify(receiptData),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server error response:', errorData);
        const errorMessage = errorData.error || 'Failed to create receipt. Please try again.';
        showToast({
          variant: 'error',
          message: errorMessage
        });
        throw new Error(`Failed to create receipt: ${errorMessage}`);
      }
      
      // Get the created receipt
      const createdReceipt = await response.json();
      
      // Show success message and redirect
      showToast({
        variant: 'success',
        message: 'Receipt created successfully!'
      });
      
      // Redirect after a short delay to allow the toast to be seen
      setTimeout(() => {
        router.push('/receipts');
        router.refresh();
      }, 1500);
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Extract error message if available
      let message = 'Failed to create receipt. Please try again.';
      if (error instanceof Error) {
        if (error.message.includes('Failed to create receipt:')) {
          message = error.message;
        }
      }
      
      showToast({
        variant: 'error',
        message
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle product selection to auto-fill price
  const handleProductChange = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unitPrice`, product.price);
      form.setValue(`items.${index}.description`, product.description || '');
    }
  };
  
  // Handle new product creation
  const handleProductCreated = (newProduct: ProductWithRelations) => {
    setProducts(prev => [...prev, newProduct]);
    showToast({
      variant: 'success',
      message: `Product "${newProduct.name}" created successfully!`
    });
  };

  if (isLoading) {
    return <div className="flex justify-center p-6">Loading products...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Customer Information - Simple for receipts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-md bg-muted/10">
          <FormField
            control={form.control}
            name="customerName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Customer Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Walk-in Customer"
                    {...field}
                    value={field.value || ''}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="customerPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Phone number (optional)"
                    {...field}
                    value={field.value || ''}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="paymentMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Method</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment method" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CASH">Cash</SelectItem>
                    <SelectItem value="CARD">Card</SelectItem>
                    <SelectItem value="OTHER">Other</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Receipt Date */}
        <div className="p-4 border rounded-md bg-muted/10">
          <ReactDatePickerComponent
            name="receiptDate"
            label="Receipt Date"
            disabled={isSubmitting}
            minDate={new Date()} // Set minimum date to today
            dateFormat="PPP"
            placeholder="Select receipt date"
          />
        </div>

        {/* Receipt Items */}
        <div className="p-4 border rounded-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Receipt Items</h3>
            <ProductFormDialog 
              userId="1" 
              onProductCreated={handleProductCreated} 
            />
          </div>
          
          <div className="space-y-4">
            {fields.map((field, index) => (
              <div key={field.id} className="p-4 border rounded-md bg-background">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">Item {index + 1}</h4>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1 || isSubmitting}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="grid gap-4 md:grid-cols-12">
                  {/* Product Selection */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.productId`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-6">
                        <FormLabel>Product</FormLabel>
                        <Select
                          onValueChange={(value) => {
                            field.onChange(value);
                            handleProductChange(value, index);
                          }}
                          defaultValue={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a product" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {products.map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="md:col-span-6 grid grid-cols-3 gap-2">
                    {/* Quantity */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Qty</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Unit Price */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Amount (Calculated) */}
                    <div>
                      <FormLabel>Amount</FormLabel>
                      <div className="h-10 flex items-center px-3 border rounded-md bg-muted/50">
                        {formatCurrency(
                          (form.watch(`items.${index}.quantity`) || 0) * 
                          (form.watch(`items.${index}.unitPrice`) || 0),
                          settings
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="md:col-span-12">
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Item description"
                            {...field}
                            value={field.value || ''}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({
                productId: '',
                quantity: 1,
                unitPrice: 0,
                description: '',
              })}
              disabled={isSubmitting}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </div>
        </div>

        {/* Notes and Summary */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Notes (optional) */}
          <div className="p-4 border rounded-md">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Optional notes for this receipt"
                      {...field}
                      value={field.value || ''}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Receipt Summary */}
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-4">Receipt Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between border-b py-2">
                <span>Total Items:</span>
                <span className="font-medium">{fields.reduce((sum, item) => sum + Number(form.watch(`items.${fields.indexOf(item)}.quantity`)), 0)}</span>
              </div>
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>Total:</span>
                <span>{formatCurrency(totals.total, settings)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/receipts')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Receipt'}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default ReceiptFormEnhanced;