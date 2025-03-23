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

export default function SettingsPage() {
  const { showToast } = useToast();
  const { settings, updateSettings } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [fieldsLocked, setFieldsLocked] = useState(false);
  const [company, setCompany] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formIsDirty, setFormIsDirty] = useState(false);
  const [userData, setUserData] = useState<any>(null);
  const [fieldNames, setFieldNames] = useState<string[]>([]);
  const [saveError, setSaveError] = useState<string | null>(null);
  
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

  // Function to refresh user data
  const refreshUserData = () => {
    console.log('refreshUserData called');
    // Add a small delay to prevent multiple rapid refreshes
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 300);
  };

  // Watch for form changes to enable/disable save button
  useEffect(() => {
    const subscription = form.watch(() => {
      setFormIsDirty(form.formState.isDirty);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Use a ref to track the previous refresh trigger value
  const prevRefreshTriggerRef = React.useRef(refreshTrigger);
  const mountedRef = React.useRef(true);
  
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);
  
  useEffect(() => {
    // Skip initial render
    if (prevRefreshTriggerRef.current === refreshTrigger) {
      return;
    }
    
    // Update ref with current value
    prevRefreshTriggerRef.current = refreshTrigger;
    
    let isMounted = true;
    
    async function fetchCompanyDetails() {
      if (!mountedRef.current) return;
    
      try {
        setLoadingCompany(true);
        const response = await fetch('/api/company');
        
        if (!mountedRef.current) return;
        
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
        if (mountedRef.current) {
          showToast({
            message: 'Failed to fetch company details',
            variant: 'error'
          });
        }
      } finally {
        if (mountedRef.current) {
          setLoadingCompany(false);
          // Only set overall loading to false if both fetches are complete
          if (!loadingUser) {
            setIsLoading(false);
          }
        }
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
            
            // If we have user data but no company data yet, pre-populate the email field
            if (data.user.email && !company) {
              form.setValue('email', data.user.email);
            }
          }
        } else {
          console.error('Failed to fetch user data:', response.statusText);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        // Always ensure loading state is completed
        setIsLoading(false);
      }
    }

    // Fetch data when component mounts or refreshTrigger changes
    fetchCompanyDetails();
    fetchUserData();
    
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
  }, []);

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
                              <Input 
                                {...field} 
                                disabled={isSaving || true} 
                                className="bg-muted text-muted-foreground"
                              />
                            </FormControl>
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