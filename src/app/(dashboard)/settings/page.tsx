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
import { MSICCodeSearch } from '@/components/ui/msic-code-search';

// Form validation schema
const companyFormSchema = z.object({
  legalName: z.string().min(1, { message: 'Legal business name is required' }),
  ownerName: z.string().min(1, { message: 'Owner name is required' }),
  registrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  email: z.string().email({ message: 'Please enter a valid email' }).optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().min(1, { message: 'Address line 1 is required' }),
  postcode: z.string().min(1, { message: 'Postcode is required' }),
  city: z.string().min(1, { message: 'City is required' }),
  country: z.string().default('Malaysia'),
  termsAndConditions: z.string().optional(),
  paymentMethod: z.enum(['bank', 'qr']).optional(),
  bankAccountName: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  qrImageUrl: z.string().optional(),
  msicCode: z.string().optional(),
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
      addressLine1: '',
      postcode: '',
      city: '',
      country: 'Malaysia',
      termsAndConditions: '',
      paymentMethod: undefined,
      bankAccountName: '',
      bankName: '',
      bankAccountNumber: '',
      qrImageUrl: '',
      msicCode: '',
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
            addressLine1: data.addressLine1 || '',
            postcode: data.postcode || '',
            city: data.city || '',
            country: data.country || 'Malaysia',
            termsAndConditions: data.termsAndConditions || '',
            paymentMethod: data.paymentMethod || undefined,
            bankAccountName: data.bankAccountName || '',
            bankName: data.bankName || '',
            bankAccountNumber: data.bankAccountNumber || '',
            qrImageUrl: data.qrImageUrl || '',
            msicCode: data.msicCode || '',
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
  
  const updateAppSettings = async (newSettings: Partial<{currency: {code: string, locale: string}, enableReceiptsModule: boolean}>) => {
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

      <div className="grid gap-8 lg:grid-cols-2">
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
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Business Address</h3>
                      <div className="grid gap-4">
                        <FormField
                          control={form.control}
                          name="addressLine1"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Address</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  disabled={isSaving}
                                  placeholder="Street address"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="postcode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postcode</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    disabled={isSaving}
                                    placeholder="Postcode"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field} 
                                    disabled={isSaving}
                                    placeholder="City"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="country"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Country</FormLabel>
                              <FormControl>
                                <Select
                                  defaultValue={field.value || 'Malaysia'}
                                  onValueChange={field.onChange}
                                  disabled={isSaving}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select country" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="Malaysia">Malaysia</SelectItem>
                                    <SelectItem value="Singapore">Singapore</SelectItem>
                                    <SelectItem value="Indonesia">Indonesia</SelectItem>
                                    <SelectItem value="Thailand">Thailand</SelectItem>
                                    <SelectItem value="Vietnam">Vietnam</SelectItem>
                                    <SelectItem value="Philippines">Philippines</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                    
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
                    
                    <div className="mb-4">
                      <h3 className="text-sm font-medium mb-2">Payment Information</h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        This information will be displayed on your invoices to let your customers know how to pay you
                      </p>
                      
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Method</FormLabel>
                            <FormControl>
                              <Select
                                value={field.value}
                                onValueChange={field.onChange}
                                disabled={isSaving}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment method" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bank">Bank Transfer</SelectItem>
                                  <SelectItem value="qr">QR Code</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {form.watch('paymentMethod') === 'bank' && (
                        <div className="mt-4 space-y-4">
                          <FormField
                            control={form.control}
                            name="bankAccountName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Account Name</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bankName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Name</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="bankAccountNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Bank Account Number</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled={isSaving} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                      
                      {form.watch('paymentMethod') === 'qr' && (
                        <div className="mt-4">
                          <FormField
                            control={form.control}
                            name="qrImageUrl"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>QR Code Image</FormLabel>
                                <FormControl>
                                  <div className="space-y-4">
                                    {field.value && (
                                      <div className="border p-4 rounded-md w-48 h-48 flex items-center justify-center">
                                        <img 
                                          src={field.value} 
                                          alt="Payment QR Code" 
                                          className="max-w-full max-h-full object-contain"
                                        />
                                      </div>
                                    )}
                                    <Input 
                                      type="file" 
                                      accept="image/*"
                                      disabled={isSaving}
                                      onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                          const reader = new FileReader();
                                          reader.onload = (event) => {
                                            field.onChange(event.target?.result as string);
                                          };
                                          reader.readAsDataURL(file);
                                        }
                                      }}
                                    />
                                  </div>
                                </FormControl>
                                <FormDescription>
                                  Upload an image of your payment QR code
                                </FormDescription>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </div>
                    
                    <Card className="bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900">
                      <CardHeader>
                        <CardTitle>e-Invoicing</CardTitle>
                        <CardDescription>
                          Information required for Malaysia's e-invoicing compliance
                        </CardDescription>
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
                                Malaysian Standard Industrial Classification code for your business
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                    
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
          
          <Card>
            <CardHeader>
              <CardTitle>Module Settings</CardTitle>
              <CardDescription>
                Enable or disable optional modules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="block text-sm font-medium">Receipts Module</label>
                    <p className="text-sm text-muted-foreground">
                      Enable quick receipt generation for walk-in customers
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant={settings.enableReceiptsModule ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateAppSettings({ enableReceiptsModule: true });
                      }}
                    >
                      Enable
                    </Button>
                    <Button 
                      variant={!settings.enableReceiptsModule ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        updateAppSettings({ enableReceiptsModule: false });
                      }}
                    >
                      Disable
                    </Button>
                  </div>
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