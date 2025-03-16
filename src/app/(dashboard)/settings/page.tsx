'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { useToast } from '@/components/ui/toast';
import { Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AppSettings, defaultSettings } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Form validation schema
const companyFormSchema = z.object({
  legalName: z.string().min(1, { message: 'Legal business name is required' }),
  ownerName: z.string().min(1, { message: 'Owner name is required' }),
  registrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
  termsAndConditions: z.string().optional(),
});

type CompanyFormValues = z.infer<typeof companyFormSchema>;

const currencies = [
  { code: 'MYR', name: 'Malaysian Ringgit', locale: 'en-MY' },
  { code: 'USD', name: 'US Dollar', locale: 'en-US' },
  { code: 'EUR', name: 'Euro', locale: 'en-EU' },
  { code: 'GBP', name: 'British Pound', locale: 'en-GB' },
  { code: 'SGD', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
];

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [formValues, setFormValues] = useState<CompanyFormValues | null>(null);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { showToast } = useToast();

  // Initialize form
  const form = useForm<CompanyFormValues>({
    resolver: zodResolver(companyFormSchema),
    defaultValues: {
      legalName: '',
      ownerName: '',
      registrationNumber: '',
      taxIdentificationNumber: '',
      email: '',
      phoneNumber: '',
      address: '',
      termsAndConditions: 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.',
    },
  });

  // Fetch company details on component mount
  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/company');
        
        if (response.ok) {
          const data = await response.json();
          
          // If company data exists, populate the form
          if (data) {
            form.reset({
              legalName: data.legalName || '',
              ownerName: data.ownerName || '',
              registrationNumber: data.registrationNumber || '',
              taxIdentificationNumber: data.taxIdentificationNumber || '',
              email: data.email || '',
              phoneNumber: data.phoneNumber || '',
              address: data.address || '',
              termsAndConditions: data.termsAndConditions || 'Full payment is due upon receipt of this invoice. Late payments may incur additional charges or interest as per the applicable laws.',
            });
            
            // Check if critical fields are filled to determine if they should be locked
            if (data.legalName && data.registrationNumber && data.taxIdentificationNumber) {
              setFieldsLocked(true);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        showToast({
          message: 'Failed to load company details',
          variant: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchCompanyDetails();
  }, [form, showToast]);

  // Handle form submission
  const handleSubmit = (values: CompanyFormValues) => {
    setFormValues(values);
    setConfirmDialogOpen(true);
  };

  // Handle confirmation dialog confirm
  const handleConfirmSave = async () => {
    if (!formValues) return;
    
    setIsSaving(true);
    setConfirmDialogOpen(false);
    
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formValues),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save company details');
      }
      
      showToast({
        message: 'Company details saved successfully',
        variant: 'success'
      });
      
      // Lock critical fields if they are all filled
      if (formValues.legalName && formValues.registrationNumber && formValues.taxIdentificationNumber) {
        setFieldsLocked(true);
      }
      
      // Refresh the page to reflect changes
      window.location.reload();
    } catch (error) {
      console.error('Error saving company details:', error);
      showToast({
        message: 'Failed to save company details',
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCurrencyChange = async (currencyCode: string) => {
    const selectedCurrency = currencies.find(c => c.code === currencyCode);
    if (!selectedCurrency) return;

    setIsSaving(true);
    try {
      const newSettings: AppSettings = {
        ...settings,
        currency: {
          code: selectedCurrency.code,
          locale: selectedCurrency.locale
        }
      };

      updateSettings(newSettings);

      showToast({
        message: 'Currency preferences saved successfully',
        variant: 'success'
      });
    } catch (error) {
      showToast({
        message: 'Failed to save currency preferences',
        variant: 'error'
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading company details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your company details and preferences</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Company Details</CardTitle>
          <CardDescription>
            These details will appear on your invoices and other documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="legalName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Legal Business Name</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSaving || fieldsLocked} 
                          className={fieldsLocked ? "bg-muted text-muted-foreground" : ""}
                        />
                      </FormControl>
                      {fieldsLocked && (
                        <FormDescription>
                          This field cannot be changed after confirmation
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="ownerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Owner Name</FormLabel>
                      <FormControl>
                        <Input {...field} disabled={isSaving} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="registrationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Registration (SSM) ID</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSaving || fieldsLocked}
                          className={fieldsLocked ? "bg-muted text-muted-foreground" : ""}
                        />
                      </FormControl>
                      <FormDescription>
                        {fieldsLocked 
                          ? "This field cannot be changed after confirmation" 
                          : "Alphanumeric ID from your business registration"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="taxIdentificationNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tax Identification Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={isSaving || fieldsLocked}
                          className={fieldsLocked ? "bg-muted text-muted-foreground" : ""}
                        />
                      </FormControl>
                      {fieldsLocked && (
                        <FormDescription>
                          This field cannot be changed after confirmation
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} disabled={isSaving} />
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
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled={true}
                          className="bg-muted text-muted-foreground"
                        />
                      </FormControl>
                      <FormDescription>
                        This field cannot be changed as it is linked to your account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={3} 
                        placeholder="Enter your company's full address" 
                        {...field} 
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="termsAndConditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Invoice Terms & Conditions</FormLabel>
                    <FormControl>
                      <Textarea 
                        rows={4} 
                        placeholder="Enter your invoice terms and conditions" 
                        {...field} 
                        disabled={isSaving}
                      />
                    </FormControl>
                    <FormDescription>
                      This text will appear in the Terms & Conditions section of your invoices
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency Settings</CardTitle>
          <CardDescription>
            Configure your preferred currency for invoices and financial calculations
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid gap-2">
            <label className="text-sm font-medium">Currency</label>
            <Select
              value={settings.currency.code}
              onValueChange={handleCurrencyChange}
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencies.map((currency) => (
                  <SelectItem key={currency.code} value={currency.code}>
                    {currency.name} ({currency.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              This will be used for all monetary values across the application
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Changes</DialogTitle>
            <DialogDescription>
              Are you sure you want to save these changes? Once confirmed, your Legal Business Name, 
              Company Registration ID, and Tax Identification Number cannot be changed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmSave}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 