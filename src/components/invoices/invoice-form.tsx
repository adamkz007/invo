'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import type { Control } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { EnhancedDatePicker } from '@/components/ui/enhanced-date-picker';
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
import { Trash2, Plus, X } from 'lucide-react';
import { CustomerWithRelations, ProductWithRelations, InvoiceFormValues, InvoiceItemFormValues, InvoiceStatus } from '@/types';
import { calculateInvoiceTotals, formatCurrency } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import { useToast } from '@/components/ui/toast';
import { InlineLoading } from '@/components/ui/loading';

// Define valid invoice statuses
const INVOICE_STATUSES = ['DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'] as const;

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
    disableStockManagement: z.boolean().default(false),
  })).min(1, { message: 'Add at least one item' }),
  taxRate: z.coerce.number().min(0).max(100),
  discountRate: z.coerce.number().min(0).max(100),
  notes: z.string().optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  userId: z.string().optional(),
});

interface InvoiceFormProps {
  defaultValues?: InvoiceFormValues;
  isEditing?: boolean;
}

export default function InvoiceForm({ defaultValues, isEditing = false }: InvoiceFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customers, setCustomers] = useState<CustomerWithRelations[]>([]);
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

  // Fetch customers and products when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch customers
        const customersResponse = await fetch('/api/customer');
        if (!customersResponse.ok) {
          throw new Error('Failed to fetch customers');
        }
        const customersData = await customersResponse.json();
        setCustomers(customersData);

        // Fetch products
        const productsResponse = await fetch('/api/product');
        if (!productsResponse.ok) {
          throw new Error('Failed to fetch products');
        }
        const productsData = await productsResponse.json();
        setProducts(productsData.products || []);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast({
          variant: "error",
          message: "Failed to load customers or products. Please try again."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [showToast]);

  // Initialize form with default values or new invoice values
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues || {
      customerId: '',
      issueDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      status: InvoiceStatus.DRAFT,
      taxRate: 0,
      discountRate: 0,
      notes: '',
      items: [
        {
          productId: '',
          quantity: 1,
          unitPrice: 0,
          description: '',
          disableStockManagement: false,
        },
      ],
      userId: '',
    },
  });

  // Create field array for invoice items
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
        values.taxRate || 0,
        values.discountRate || 0
      );
      setTotals(totals);
    });

    return () => subscription.unsubscribe();
  }, [form]);

  // Handle form submission
  async function onSubmit(values: InvoiceFormValues) {
    setIsSubmitting(true);
    
    try {
      // In a real application, this would submit to the API
      console.log('Form submitted with values:', values);
      console.log('Calculated totals:', totals);
      
      // Show success message and redirect
      alert('Invoice created successfully!');
      router.push('/invoices');
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to create invoice. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle product selection to auto-fill price
  const handleProductChange = (productId: string, index: number) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      const currentItems = form.getValues('items');
      const updatedItems = [...currentItems];
      updatedItems[index] = {
        ...updatedItems[index],
        unitPrice: product.price,
        description: product.description || '',
        disableStockManagement: product.disableStockManagement || false,
      };
      form.setValue(`items.${index}.unitPrice`, product.price);
      form.setValue(`items.${index}.description`, product.description || '');
      form.setValue(`items.${index}.disableStockManagement`, product.disableStockManagement || false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Customer Selection */}
          <Card>
            <CardContent className="pt-6">
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value}
                      disabled={isSubmitting}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a customer" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {INVOICE_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
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
              {/* Issue Date */}
              <EnhancedDatePicker
                name="issueDate"
                label="Issue Date"
                disabled={isSubmitting}
                minDate={new Date('1900-01-01')}
                dateFormat="yyyy-MM-dd"
                placeholder="YYYY-MM-DD"
              />

              {/* Due Date */}
              <div className="mt-4">
                <EnhancedDatePicker
                  name="dueDate"
                  label="Due Date"
                  disabled={isSubmitting}
                  minDate={new Date('1900-01-01')}
                  dateFormat="yyyy-MM-dd"
                  placeholder="YYYY-MM-DD"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Invoice Items */}
        <Card>
          <CardContent className="pt-6">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-medium">Invoice Items</h3>
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
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-md border p-4">
                  <div className="mb-4 flex items-center justify-between">
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

                  <div className="grid gap-4 md:grid-cols-4">
                    {/* Product Selection */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.productId`}
                      render={({ field }) => (
                        <FormItem>
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
                              min={1}
                              step={1}
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)}
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
                          <FormLabel>Unit Price</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min={0}
                              step={0.01}
                              {...field}
                              onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Amount (calculated) */}
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <div className="flex h-10 items-center rounded-md border bg-muted/50 px-3">
                        {formatCurrency(
                          (form.watch(`items.${index}.quantity`) || 0) *
                          (form.watch(`items.${index}.unitPrice`) || 0),
                          settings
                        )}
                      </div>
                    </FormItem>

                    {/* Description */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-4">
                          <FormLabel>Description</FormLabel>
                          <FormControl>
                            <Textarea
                              rows={2}
                              placeholder="Enter description"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {/* Disable Stock Management */}
                    <FormField
                      control={form.control}
                      name={`items.${index}.disableStockManagement`}
                      render={({ field }) => (
                        <FormItem className="md:col-span-4 flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              Disable Stock Management
                            </FormLabel>
                            <FormDescription>
                              Check this if you don't want to track inventory for this item
                            </FormDescription>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Invoice Totals and Additional Fields */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h3 className="mb-4 text-lg font-medium">Additional Information</h3>
                
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
                          min={0}
                          max={100}
                          step={0.1}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
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
                    <FormItem className="mt-4">
                      <FormLabel>Discount Rate (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          step={0.1}
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Notes */}
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem className="mt-4">
                      <FormLabel>Notes</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="Enter notes for this invoice"
                          {...field}
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormDescription>
                        These notes will be visible to the customer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Invoice Summary */}
              <div>
                <h3 className="mb-4 text-lg font-medium">Invoice Summary</h3>
                <div className="rounded-md border p-4">
                  <div className="space-y-2">
                    <div className="flex justify-between border-b py-2">
                      <span>Subtotal:</span>
                      <span className="font-medium">{formatCurrency(totals.subtotal, settings)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span>Tax ({form.watch('taxRate')}%):</span>
                      <span>{formatCurrency(totals.taxAmount, settings)}</span>
                    </div>
                    <div className="flex justify-between border-b py-2">
                      <span>Discount ({form.watch('discountRate')}%):</span>
                      <span>-{formatCurrency(totals.discountAmount, settings)}</span>
                    </div>
                    <div className="flex justify-between py-2 text-lg font-bold">
                      <span>Total:</span>
                      <span>{formatCurrency(totals.total, settings)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/invoices')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? <InlineLoading text="Saving..." />
              : isEditing
              ? 'Update Invoice'
              : 'Create Invoice'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
