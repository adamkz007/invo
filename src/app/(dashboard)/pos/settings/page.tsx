'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Settings, Printer, LayoutGrid, Receipt, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

const posSettingsSchema = z.object({
  taxRate: z.coerce
    .number()
    .min(0, 'Tax rate must be 0 or higher')
    .max(100, 'Tax rate cannot exceed 100%'),
  serviceChargeRate: z.coerce
    .number()
    .min(0, 'Service charge must be 0 or higher')
    .max(100, 'Service charge cannot exceed 100%'),
  tableLayoutType: z.enum(['LIST', 'MAP']),
  autoPrintEnabled: z.boolean(),
  defaultPrinterAddress: z.string().optional(),
});

type PosSettingsFormValues = z.infer<typeof posSettingsSchema>;

export default function PosSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<PosSettingsFormValues>({
    resolver: zodResolver(posSettingsSchema),
    defaultValues: {
      taxRate: 0,
      serviceChargeRate: 0,
      tableLayoutType: 'LIST',
      autoPrintEnabled: false,
      defaultPrinterAddress: '',
    },
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/pos/settings');
      if (response.ok) {
        const data = await response.json();
        const settings = data.settings;
        form.reset({
          taxRate: Number(settings.taxRate) || 0,
          serviceChargeRate: Number(settings.serviceChargeRate) || 0,
          tableLayoutType: settings.tableLayoutType || 'LIST',
          autoPrintEnabled: settings.autoPrintEnabled || false,
          defaultPrinterAddress: settings.defaultPrinterAddress || '',
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (values: PosSettingsFormValues) => {
    setSaving(true);
    try {
      const response = await fetch('/api/pos/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/pos">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS Settings</h1>
          <p className="text-muted-foreground">
            Configure your Point of Sale preferences
          </p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Pricing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Pricing & Charges
              </CardTitle>
              <CardDescription>
                Set default tax and service charge rates for POS orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taxRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Rate (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Applied to subtotal + service charge (e.g., SST 6%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="serviceChargeRate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Service Charge (%)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            max="100"
                            placeholder="0"
                            {...field}
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            %
                          </span>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Applied to subtotal before tax (e.g., 10%)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Preview calculation */}
              {(form.watch('taxRate') > 0 || form.watch('serviceChargeRate') > 0) && (
                <div className="rounded-lg bg-muted/50 p-4 text-sm">
                  <p className="font-medium mb-2">Example calculation (RM 100 order):</p>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>RM 100.00</span>
                    </div>
                    {form.watch('serviceChargeRate') > 0 && (
                      <div className="flex justify-between">
                        <span>Service Charge ({form.watch('serviceChargeRate')}%)</span>
                        <span>RM {(100 * form.watch('serviceChargeRate') / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {form.watch('taxRate') > 0 && (
                      <div className="flex justify-between">
                        <span>Tax ({form.watch('taxRate')}%)</span>
                        <span>
                          RM {((100 + (100 * form.watch('serviceChargeRate') / 100)) * form.watch('taxRate') / 100).toFixed(2)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between font-medium text-foreground pt-1 border-t">
                      <span>Total</span>
                      <span>
                        RM {(
                          100 +
                          (100 * form.watch('serviceChargeRate') / 100) +
                          ((100 + (100 * form.watch('serviceChargeRate') / 100)) * form.watch('taxRate') / 100)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Display Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LayoutGrid className="h-5 w-5" />
                Display Settings
              </CardTitle>
              <CardDescription>
                Configure how tables and orders are displayed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="tableLayoutType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Table Layout</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="w-full sm:w-[200px]">
                          <SelectValue placeholder="Select layout" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="LIST">List View</SelectItem>
                        <SelectItem value="MAP">Floor Map View</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose how to display tables (Map view coming soon)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* Print Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Printing
              </CardTitle>
              <CardDescription>
                Configure automatic printing for kitchen orders
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="autoPrintEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-print Kitchen Chits</FormLabel>
                      <FormDescription>
                        Automatically print kitchen chits when new orders are created
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {form.watch('autoPrintEnabled') && (
                <FormField
                  control={form.control}
                  name="defaultPrinterAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Printer Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., 192.168.1.100 or BT:Kitchen_Printer"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Network IP or Bluetooth address for the kitchen printer
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
