'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Combobox } from '@/components/ui/combobox';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { format } from 'date-fns';
import { Trash2, Plus } from 'lucide-react';
import { DatePicker } from '@/components/ui/date-picker';
import { Checkbox } from '@/components/ui/checkbox';
// Define InvoiceStatus enum locally
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}
import { calculateInvoiceTotals, formatCurrency } from '@/lib/utils';
import { CustomerWithRelations, ProductWithRelations, InvoiceFormValues } from '@/types';
import CustomerFormDialog from '@/components/customers/customer-form-dialog';
import ProductFormDialog from '@/components/products/product-form-dialog';
import { useToast } from '@/components/ui/toast';
import { Badge } from '@/components/ui/badge';

// Form validation schema
const invoiceFormSchema = z.object({
  customerId: z.string().min(1, { message: 'Please select a customer' }),
  issueDate: z.date(),
  dueDate: z.date(),
  status: z.nativeEnum(InvoiceStatus),
  items: z.array(z.object({
    productId: z.string().min(1, { message: 'Please select a product' }),
    quantity: z.coerce.number().min(1, { message: 'Quantity must be at least 1' }),
    unitPrice: z.coerce.number().min(0.01, { message: 'Price must be greater than 0' }),
    description: z.string().optional(),
    disableStockManagement: z.boolean().optional().default(false),
  })).min(1, { message: 'Add at least one item' }),
  taxRate: z.coerce.number().min(0).max(100),
  discountRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  userId: z.string().optional(),
});

interface InvoiceFormProps {
  defaultValues?: InvoiceFormValues;
  isEditing?: boolean;
  preSelectedCustomerId?: string | null;
}

export default function InvoiceFormEnhanced({ 
  defaultValues, 
  isEditing = false,
  preSelectedCustomerId = null 
}: InvoiceFormProps) {
  const router = useRouter();
  const { showToast } = useToast();

  // Initialize form first, before any effects that depend on it
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues || {
      customerId: preSelectedCustomerId || '',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
      status: InvoiceStatus.DRAFT,
      items: [{ productId: '', quantity: 1, unitPrice: 0, description: '', disableStockManagement: false }],
      taxRate: 0,
      discountRate: 0,
      notes: '',
      userId: '',
    },
  });

  // State declarations
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
  const [products, setProducts] = useState<ProductWithRelations[]>([]);
  const [totals, setTotals] = useState({
    subtotal: 0,
    taxAmount: 0,
    discountAmount: 0,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [minDueDate, setMinDueDate] = useState<Date>(form.getValues('issueDate'));

  // Create field array for invoice items
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  // Update minDueDate when issue date changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'issueDate') {
        const issueDate = value.issueDate as Date;
        setMinDueDate(issueDate);
        
        // Also update due date if it's now before issue date
        const currentDueDate = form.getValues('dueDate') as Date;
        if (currentDueDate < issueDate) {
          form.setValue('dueDate', issueDate);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Calculate totals whenever form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      const totals = calculateInvoiceTotals(
        values.items?.map(item => ({
          quantity: item?.quantity || 0,
          unitPrice: item?.unitPrice || 0,
        })) || [],
        values.taxRate || 0,
        values.discountRate || 0
      );
      setTotals(totals);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Set the selected customer if preSelectedCustomerId changes
  useEffect(() => {
    if (preSelectedCustomerId && !isEditing) {
      form.setValue('customerId', preSelectedCustomerId);
    }
  }, [preSelectedCustomerId, form, isEditing]);

  // Fetch customers and products
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products')
        ]);
        
        if (customersRes.ok && productsRes.ok) {
          const [customersData, productsData] = await Promise.all([
            customersRes.json(),
            productsRes.json()
          ]);
          
          setCustomers(customersData);
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Handle form submission
  async function onSubmit(values: InvoiceFormValues) {
    setIsSubmitting(true);
    
    try {
      // Get the auth token from cookies
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);
      
      // Default user ID for demo purposes
      let userId = '1';
      
      // If we have an auth token, we'll use it in the request
      // The server will extract the user ID from the token
      
      // Add calculated totals and user ID to the form values
      const invoiceData = {
        ...values,
        userId,
        subtotal: totals.subtotal,
        taxAmount: totals.taxAmount,
        discountAmount: totals.discountAmount,
        total: totals.total
      };
      
      // Debug log
      console.log('Submitting invoice data:', JSON.stringify(invoiceData, null, 2));
      
      // Submit to the API
      try {
        console.log('Attempting to fetch:', '/api/invoices');
        const response = await fetch('/api/invoices', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(invoiceData),
          // Add these options to help with potential fetch issues
          credentials: 'same-origin',
          mode: 'same-origin',
        });
        
        console.log('Fetch response received:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorData = await response.json().catch((err) => {
            console.error('Error parsing error response:', err);
            return {};
          });
          console.error('Server error response:', errorData);
          const errorMessage = errorData.error || 'Failed to create invoice. Please try again.';
          showToast({
            variant: 'error',
            message: errorMessage
          });
          throw new Error(`Failed to create invoice: ${errorMessage}`);
        }
        
        // Show success message and redirect
        showToast({
          variant: 'success',
          message: 'Invoice created successfully!'
        });
        
        // Redirect after a short delay to allow the toast to be seen
        setTimeout(() => {
          router.push('/invoices');
          router.refresh();
        }, 1500);
      } catch (fetchError) {
        console.error('Fetch error details:', fetchError);
        
        // Check for network error
        if (fetchError instanceof TypeError && fetchError.message.includes('Failed to fetch')) {
          console.error('Network error detected. API endpoint might be unavailable.');
          showToast({
            variant: 'error',
            message: 'Network error: Unable to connect to the server. Please check your connection and try again.'
          });
        } else {
          // Other error handling
          showToast({
            variant: 'error',
            message: 'Error submitting invoice. Please try again.'
          });
        }
        
        throw fetchError; // Rethrow to be caught by the outer catch
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      
      // Extract error message if available
      let message = 'Failed to create invoice. Please try again.';
      if (error instanceof Error) {
        // If the error contains our specific prefix, just display the message as is
        if (error.message.includes('Failed to create invoice:')) {
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
      form.setValue(`items.${index}.disableStockManagement`, product.disableStockManagement || false);
      
      // If disabling stock management, set quantity to 1
      if (product.disableStockManagement) {
        form.setValue(`items.${index}.quantity`, 1);
      }
    }
  };
  
  // Handle new customer creation
  const handleCustomerCreated = (newCustomer: CustomerWithRelations) => {
    setCustomers(prev => [...prev, newCustomer]);
    form.setValue('customerId', newCustomer.id);
    showToast({
      variant: 'success',
      message: `Customer "${newCustomer.name}" created successfully!`
    });
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
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Selection */}
          <Card>
            <CardContent className="pt-6">
              <FormLabel>Customer</FormLabel>
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex gap-2 items-center">
                        <div className="flex-1">
                          <Combobox
                            options={customers.map((customer) => ({
                              value: customer.id,
                              label: customer.name,
                              details: customer.phoneNumber || ''
                            }))}
                            value={field.value}
                            onChange={field.onChange}
                            placeholder="Select a customer"
                            searchPlaceholder="Search by name or phone number..."
                            emptyText="No customers found"
                            disabled={isSubmitting}
                          />
                        </div>
                        <CustomerFormDialog 
                          userId="1" 
                          onCustomerCreated={handleCustomerCreated} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Invoice Status */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="mt-4">
                    <FormLabel>Status</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status">
                            {field.value && (
                              <div className="flex items-center">
                                {field.value === 'DRAFT' && <Badge className="bg-gray-100 text-gray-800 mr-2">Draft</Badge>}
                                {field.value === 'SENT' && <Badge className="bg-blue-100 text-blue-800 mr-2">Sent</Badge>}
                                {field.value === 'PAID' && <Badge className="bg-green-100 text-green-800 mr-2">Paid</Badge>}
                                {field.value === 'PARTIAL' && <Badge className="bg-amber-100 text-amber-800 mr-2">Partial</Badge>}
                                {field.value === 'OVERDUE' && <Badge className="bg-red-100 text-red-800 mr-2">Overdue</Badge>}
                                {field.value === 'CANCELLED' && <Badge className="bg-purple-100 text-purple-800 mr-2">Cancelled</Badge>}
                              </div>
                            )}
                          </SelectValue>
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="DRAFT">
                          <div className="flex items-center">
                            <Badge className="bg-gray-100 text-gray-800 mr-2">Draft</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="SENT">
                          <div className="flex items-center">
                            <Badge className="bg-blue-100 text-blue-800 mr-2">Sent</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="PAID">
                          <div className="flex items-center">
                            <Badge className="bg-green-100 text-green-800 mr-2">Paid</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="PARTIAL">
                          <div className="flex items-center">
                            <Badge className="bg-amber-100 text-amber-800 mr-2">Partial</Badge>
                          </div>
                        </SelectItem>
                        <SelectItem value="OVERDUE">
                          <div className="flex items-center">
                            <Badge className="bg-red-100 text-red-800 mr-2">Overdue</Badge>                          </div>
                        </SelectItem>
                        <SelectItem value="CANCELLED">
                          <div className="flex items-center">
                            <Badge className="bg-purple-100 text-purple-800 mr-2">Cancelled</Badge>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Dates */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 sm:grid-cols-2">
                {/* Issue Date */}
                <DatePicker
                  name="issueDate"
                  label="Issue Date"
                  disabled={isSubmitting}
                  minDate={new Date('2000-01-01')}
                />

                {/* Due Date */}
                <DatePicker
                  name="dueDate"
                  label="Due Date"
                  disabled={isSubmitting}
                  fromDate={minDueDate}
                  minDate={new Date('1900-01-01')}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Invoice Items</h3>
              <ProductFormDialog 
                userId="1" 
                onProductCreated={handleProductCreated} 
              />
            </div>
            
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border rounded-md">
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
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Product Selection */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Product</FormLabel>
                          <FormControl>
                            <Combobox
                              options={products.map((product) => ({
                                value: product.id,
                                label: product.name,
                                details: product.sku || product.description || ''
                              }))}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                                handleProductChange(value, index);
                              }}
                              placeholder="Select a product"
                              searchPlaceholder="Search products..."
                              emptyText="No products found"
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Quantity */}
                      <FormField
                        control={form.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                {...field}
                                disabled={isSubmitting || form.watch(`items.${index}.disableStockManagement`)}
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
                    </div>
                    
                    {/* Disable Stock Management */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.disableStockManagement`}
                      render={({ field }) => (
                        <FormItem className="mt-2 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={(checked) => {
                                field.onChange(checked);
                                if (checked) {
                                  // If disabling stock management, set quantity to 1
                                  form.setValue(`items.${index}.quantity`, 1);
                                }
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>Disable Stock Management</FormLabel>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Description */}
                  <FormField
                    control={form.control}
                    name={`items.${index}.description`}
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            rows={2}
                            {...field}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
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
                  disableStockManagement: false,
                })}
                disabled={isSubmitting}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Tax and Discount */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Tax Rate */}
              <FormField
                control={form.control}
                name="taxRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tax Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Discount Rate */}
              <FormField
                control={form.control}
                name="discountRate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Rate (%)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        {...field}
                        disabled={isSubmitting}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        <Card>
          <CardContent className="pt-6">
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Additional notes for the invoice"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Invoice Summary */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="text-lg font-medium mb-4">Invoice Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(totals.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({form.watch('taxRate')}%):</span>
                <span>{formatCurrency(totals.taxAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span>Discount ({form.watch('discountRate')}%):</span>
                <span>-{formatCurrency(totals.discountAmount)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(totals.total)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/invoices')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
} 