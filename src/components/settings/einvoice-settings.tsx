'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, TooltipCardTitle } from '@/components/ui/card';
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
import { useToast } from '@/components/ui/toast';
import { InlineLoading } from '@/components/ui/loading';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, ExternalLink, Info, Lock, ShieldCheck, Building2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { MSICCodeSearch } from '@/components/ui/msic-code-search';

const eInvoiceFormSchema = z.object({
  enabled: z.boolean().default(false),
  environment: z.enum(['SANDBOX', 'PRODUCTION']).default('SANDBOX'),
  myinvoisClientId: z.string().optional(),
  myinvoisClientSecret: z.string().optional(),
  supplierTin: z.string().optional(),
  supplierBrn: z.string().optional(),
  sstRegistrationNumber: z.string().optional(),
  tourismTaxNumber: z.string().optional(),
  autoSubmitOnSend: z.boolean().default(false),
  msicCode: z.string().optional(),
});

type EInvoiceFormValues = z.infer<typeof eInvoiceFormSchema>;

interface EInvoiceConfig {
  id: string;
  enabled: boolean;
  environment: 'SANDBOX' | 'PRODUCTION';
  myinvoisClientId: string | null;
  hasClientSecret: boolean;
  supplierTin: string | null;
  supplierBrn: string | null;
  sstRegistrationNumber: string | null;
  tourismTaxNumber: string | null;
  autoSubmitOnSend: boolean;
}

export function EInvoiceSettings() {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [config, setConfig] = useState<EInvoiceConfig | null>(null);

  const form = useForm<EInvoiceFormValues>({
    resolver: zodResolver(eInvoiceFormSchema),
    defaultValues: {
      enabled: false,
      environment: 'SANDBOX',
      myinvoisClientId: '',
      myinvoisClientSecret: '',
      supplierTin: '',
      supplierBrn: '',
      sstRegistrationNumber: '',
      tourismTaxNumber: '',
      autoSubmitOnSend: false,
      msicCode: '',
    },
  });

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      setIsLoading(true);

      // Fetch both e-invoice config and company data in parallel
      const [configResponse, companyResponse] = await Promise.all([
        fetch('/api/einvoice/config'),
        fetch('/api/company'),
      ]);

      let msicCode = '';
      if (companyResponse.ok) {
        const companyData = await companyResponse.json();
        if (companyData) {
          msicCode = companyData.msicCode || '';
        }
      }

      if (configResponse.ok) {
        const data = await configResponse.json();
        if (data) {
          setConfig(data);
          form.reset({
            enabled: data.enabled || false,
            environment: data.environment || 'SANDBOX',
            myinvoisClientId: data.myinvoisClientId || '',
            myinvoisClientSecret: '', // Don't pre-fill secret
            supplierTin: data.supplierTin || '',
            supplierBrn: data.supplierBrn || '',
            sstRegistrationNumber: data.sstRegistrationNumber || '',
            tourismTaxNumber: data.tourismTaxNumber || '',
            autoSubmitOnSend: data.autoSubmitOnSend || false,
            msicCode,
          });
        } else {
          // No e-invoice config yet, but still set MSIC code
          form.setValue('msicCode', msicCode);
        }
      }
    } catch (error) {
      console.error('Error fetching e-invoice config:', error);
      showToast({
        message: 'Failed to load e-Invoice settings',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function onSubmit(data: EInvoiceFormValues) {
    try {
      setIsSaving(true);

      // Only include client secret if it was changed
      const payload: any = { ...data };
      delete payload.msicCode; // Don't send msicCode to e-invoice config
      if (!payload.myinvoisClientSecret) {
        delete payload.myinvoisClientSecret;
      }

      // Save e-invoice config and MSIC code in parallel
      const [configResponse, companyResponse] = await Promise.all([
        fetch('/api/einvoice/config', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }),
        // Save MSIC code to company
        fetch('/api/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ msicCode: data.msicCode }),
        }),
      ]);

      if (configResponse.ok) {
        const updatedConfig = await configResponse.json();
        setConfig(updatedConfig);
        form.reset({
          ...data,
          myinvoisClientSecret: '', // Clear secret field after save
        });
        showToast({
          message: 'E-Invoice settings saved successfully',
          variant: 'success',
        });
      } else {
        const error = await configResponse.json();
        showToast({
          message: error.error || 'Failed to save e-Invoice settings',
          variant: 'error',
        });
      }
    } catch (error) {
      console.error('Error saving e-invoice config:', error);
      showToast({
        message: 'Failed to save e-Invoice settings',
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  }

  const isEnabled = form.watch('enabled');
  const environment = form.watch('environment');

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <InlineLoading text="Loading e-Invoice settings..." />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertTitle>Malaysia e-Invoice (LHDN MyInvois)</AlertTitle>
        <AlertDescription>
          Configure your connection to LHDN MyInvois for e-Invoice compliance.
          <a
            href="https://sdk.myinvois.hasil.gov.my/"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-1 inline-flex items-center text-primary hover:underline"
          >
            Learn more <ExternalLink className="ml-1 h-3 w-3" />
          </a>
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <TooltipCardTitle tooltip="Enable or disable e-Invoice integration">
                  E-Invoice Status
                </TooltipCardTitle>
                <Badge variant={isEnabled ? 'default' : 'secondary'}>
                  {isEnabled ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="enabled"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable e-Invoice</FormLabel>
                      <FormDescription>
                        Enable submission of invoices to LHDN MyInvois
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        disabled={isSaving}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isEnabled && (
                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Environment</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isSaving}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="SANDBOX">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
                                Sandbox
                              </Badge>
                              <span>Testing environment</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="PRODUCTION">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
                                Production
                              </Badge>
                              <span>Live environment</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {environment === 'SANDBOX'
                          ? 'Test your integration without affecting real invoices'
                          : 'Submit real invoices to LHDN'}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </CardContent>
          </Card>

          {isEnabled && (
            <>
              <Card>
                <CardHeader>
                  <TooltipCardTitle tooltip="Your MyInvois API credentials from LHDN">
                    <div className="flex items-center gap-2">
                      <Lock className="h-4 w-4" />
                      API Credentials
                    </div>
                  </TooltipCardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="myinvoisClientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client ID</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="Enter your MyInvois Client ID"
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription>
                          Your MyInvois API Client ID
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="myinvoisClientSecret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Client Secret
                          {config?.hasClientSecret && (
                            <Badge variant="outline" className="ml-2 text-green-600">
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Configured
                            </Badge>
                          )}
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            placeholder={config?.hasClientSecret ? '********' : 'Enter your MyInvois Client Secret'}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription>
                          {config?.hasClientSecret
                            ? 'Leave blank to keep existing secret, or enter a new one to update'
                            : 'Your MyInvois API Client Secret (stored securely)'}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TooltipCardTitle tooltip="Your business identification numbers for e-Invoice">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4" />
                      Supplier Identity
                    </div>
                  </TooltipCardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="supplierTin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tax Identification Number (TIN)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., C12345678901"
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription>
                            Your company TIN from LHDN
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="supplierBrn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Business Registration Number (BRN)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., 202001012345"
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription>
                            Your SSM business registration number
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="sstRegistrationNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SST Registration Number (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., W12-3456-78901234"
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription>
                            If registered for Sales and Service Tax
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="tourismTaxNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tourism Tax Number (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="e.g., TTX-123456"
                              disabled={isSaving}
                            />
                          </FormControl>
                          <FormDescription>
                            If registered for Tourism Tax
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TooltipCardTitle tooltip="Malaysian Standard Industrial Classification for your business">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Business Classification
                    </div>
                  </TooltipCardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="msicCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>MSIC Code</FormLabel>
                        <FormControl>
                          <MSICCodeSearch
                            value={field.value}
                            onChange={field.onChange}
                            disabled={isSaving}
                          />
                        </FormControl>
                        <FormDescription>
                          Malaysian Standard Industrial Classification code for your business activity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <TooltipCardTitle tooltip="Configure automatic e-Invoice behavior">
                    Automation Settings
                  </TooltipCardTitle>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="autoSubmitOnSend"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-submit on Send</FormLabel>
                          <FormDescription>
                            Automatically submit invoice to MyInvois when marked as "Sent"
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            disabled={isSaving}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </>
          )}

          <Button type="submit" disabled={isSaving} className="w-full">
            {isSaving ? <InlineLoading text="Saving..." /> : 'Save E-Invoice Settings'}
          </Button>
        </form>
      </Form>

      {environment === 'PRODUCTION' && isEnabled && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Production Mode Active</AlertTitle>
          <AlertDescription>
            You are in production mode. Invoices submitted will be sent to LHDN and cannot be undone.
            Make sure all your settings are correct before submitting invoices.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
