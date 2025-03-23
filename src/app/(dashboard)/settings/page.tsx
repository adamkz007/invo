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
import { AppSettings } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import PasswordResetForm from '@/components/settings/password-reset-form';
import { SubscriptionSettings } from '@/components/subscription/SubscriptionSettings';
import { PhoneInput } from '@/components/ui/phone-input';
import { useSearchParams, useRouter } from 'next/navigation';

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
  { code: 'AUD', name: 'Australian Dollar', locale: 'en-AU' },
  { code: 'CAD', name: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'SGD', name: 'Singapore Dollar', locale: 'en-SG' },
  { code: 'JPY', name: 'Japanese Yen', locale: 'ja-JP' },
  { code: 'CNY', name: 'Chinese Yuan', locale: 'zh-CN' },
  { code: 'INR', name: 'Indian Rupee', locale: 'en-IN' },
];

type SettingsPageProps = {
  onSubscriptionChange?: () => void;
};

export default function SettingsPage({ onSubscriptionChange }: SettingsPageProps) {
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const success = searchParams.get('success');
  const trial = searchParams.get('trial');
  
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
      termsAndConditions: '',
    },
  });

  // Watch for form changes to enable/disable save button
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormIsDirty(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);
  
  // Show success toast when redirected with success=true
  useEffect(() => {
    if (success === 'true') {
      showToast({
        message: trial === 'true' 
          ? 'Beta features activated successfully! You now have access to premium features for the trial period.' 
          : 'Subscription updated successfully!',
        variant: 'success'
      });
      
      // Remove query parameters after showing toast
      // This prevents the loading loop issue by avoiding re-renders on the same URL
      router.replace('/settings');
    }
  }, [success, trial, showToast, router]);

  // Fetch company details
  async function fetchCompanyDetails() {
    try {
      const response = await fetch('/api/company');
      
      if (response.ok) {
        const data = await response.json();
        setCompany(data);
        
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
            termsAndConditions: data.termsAndConditions || '',
          });
          
          // Lock certain fields if company exists (this is just an example)
          setFieldsLocked(!!data.registrationNumber);
        }
        
        setFormIsDirty(false);
      } else {
        showToast({
          message: 'Failed to fetch company details',
          variant: 'error'
        });
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
      showToast({
        message: 'Failed to fetch company details',
        variant: 'error'
      });
    }
  }
  
  // Fetch user data including subscription info
  async function fetchUserData() {
    try {
      console.log('Fetching user data');
      // Use the test API endpoint temporarily to bypass authentication
      const response = await fetch('/api/user/test');
      
      console.log('User data response status:', response.status);
      if (response.ok) {
        const data = await response.json();
        console.log('User data received:', data);
        if (data && data.user) {
          setUserData(data.user); 
          
          // If we have user data, pre-populate form fields as needed
          if (data.user.email && !form.getValues('email')) {
            form.setValue('email', data.user.email);
          }
          
          // Populate the phone number from the user's account if not already set
          if (data.user.phoneNumber && !form.getValues('phoneNumber')) {
            form.setValue('phoneNumber', data.user.phoneNumber);
          }
        }
      } else {
        console.error('Failed to fetch user data:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  }

  // Load data on initial mount
  useEffect(() => {
    // Skip if we've already attempted to fetch data
    if (dataFetchAttempted) {
      return;
    }
    
    const loadData = async () => {
      try {
        setIsLoading(true);
        setDataFetchAttempted(true);
        
        // Execute both fetches in parallel
        await Promise.all([
          fetchCompanyDetails(),
          fetchUserData()
        ]);
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
    
    // Set a safety timeout to prevent infinite loading
    const safetyTimer = setTimeout(() => {
      if (isLoading) {
        console.log('Safety timeout: forcing isLoading to false');
        setIsLoading(false);
      }
    }, 3000); // 3 second safety timeout
    
    return () => {
      clearTimeout(safetyTimer);
    };
  }, [dataFetchAttempted]);

  // Function to refresh user data (simplified, for subscription status updates only)
  const refreshUserData = () => {
    console.log('refreshUserData called');
    // Instead of using a trigger, just fetch data directly
    fetchUserData();
    
    if (onSubscriptionChange) {
      onSubscriptionChange();
    }
  };

  const handleSubmit = async (data: CompanyFormValues) => {
    try {
      setIsSaving(true);
      
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        const updatedCompany = await response.json();
        setCompany(updatedCompany);
        form.reset(updatedCompany);
        setFormIsDirty(false);
        
        showToast({
          message: 'Company details saved successfully',
          variant: 'success'
        });
      } else {
        showToast({
          message: 'Failed to save company details',
          variant: 'error'
        });
      }
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
  
  const updateAppSettings = async (newSettings: Partial<{currency: {code: string, locale: string}}>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      updateSettings(updatedSettings);
      
      showToast({
        message: 'Settings updated successfully',
        variant: 'success'
      });
    } catch (error) {
      console.error('Error updating settings:', error);
      showToast({
        message: 'Failed to update settings',
        variant: 'error'
      });
    }
  };

  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and business preferences.</p>
      </div>

      {console.log('Rendering with userData:', userData)}
      {userData && (
        <SubscriptionSettings user={userData} onSubscriptionChange={refreshUserData} />
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Business Details</CardTitle>
              <CardDescription>
                Information about your business that will appear on your invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                </div>
              ) : (
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
                            <FormLabel>Business Registration Number</FormLabel>
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
                        name="taxIdentificationNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tax Identification Number</FormLabel>
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
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Business Email</FormLabel>
                            <FormControl>
                              <Input {...field} disabled={isSaving} />
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
                            <FormLabel>Business Phone</FormLabel>
                            <FormControl>
                              <PhoneInput 
                                value={field.value || ''}
                                onChange={field.onChange}
                                disabled={isSaving}
                                placeholder="Enter business phone number"
                              />
                            </FormControl>
                            <FormDescription>
                              This will be shown on your invoices
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
                          <FormLabel>Business Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              disabled={isSaving}
                              className="min-h-[100px]"
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
                          <FormLabel>Terms and Conditions</FormLabel>
                          <FormControl>
                            <Textarea 
                              {...field} 
                              disabled={isSaving}
                              className="min-h-[100px]"
                            />
                          </FormControl>
                          <FormDescription>
                            These terms will appear at the bottom of your invoices
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      disabled={isSaving || !formIsDirty}
                      className="w-full"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : 'Save Changes'}
                    </Button>
                  </form>
                </Form>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Currency Settings</CardTitle>
              <CardDescription>
                Set your default currency for invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Default Currency</label>
                  <Select
                    defaultValue={settings.currency?.code || 'MYR'}
                    onValueChange={(value) => {
                      const currency = currencies.find(c => c.code === value);
                      if (currency) {
                        updateAppSettings({ 
                          currency: { 
                            code: currency.code,
                            locale: currency.locale
                          } 
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <PasswordResetForm />
        </div>
      </div>
    </div>
  );
} 