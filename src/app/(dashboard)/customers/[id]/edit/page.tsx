'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, TooltipCardTitle } from '@/components/ui/card';
import { ArrowLeft, Users } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CustomerWithRelations } from '@/types';
import { useToast } from '@/components/ui/toast';
import CustomerEditForm from '@/components/customers/customer-edit-form';

export default function EditCustomerPage({ params }: { params: { id: string } }) {
  // Access params directly
  const resolvedParams = params;
  const router = useRouter();
  const { showToast } = useToast();
  const [customer, setCustomer] = useState<CustomerWithRelations | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Fetch customer data
    const fetchCustomer = async () => {
      try {
        const response = await fetch(`/api/customers/${resolvedParams.id}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch customer');
        }
        
        const data = await response.json();
        setCustomer(data);
      } catch (err) {
        console.error('Error fetching customer:', err);
        setError('Failed to load customer data. Please try again.');
        showToast({
          message: 'Failed to load customer data',
          variant: 'error',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCustomer();
  }, [resolvedParams.id, showToast]);

  // Handle customer update
  const handleCustomerUpdated = (updatedCustomer: CustomerWithRelations) => {
    // Redirect to customers page after update
    showToast({
      message: 'Customer updated successfully',
      variant: 'success',
    });
    
    setTimeout(() => {
      router.push('/customers');
      router.refresh();
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link 
            href="/customers" 
            className="mr-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </Link>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
        </div>
        
        <Card>
          <CardHeader>
            <TooltipCardTitle tooltip="Please wait while we load the customer data.">
              Loading...
            </TooltipCardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-40 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Link 
            href="/customers" 
            className="mr-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted"
          >
            <ArrowLeft className="h-4 w-4" />
            <Users className="h-4 w-4" />
            <span>Customers</span>
          </Link>
          <h1 className="text-3xl font-bold">Edit Customer</h1>
        </div>
        
        <Card>
          <CardHeader>
            <TooltipCardTitle tooltip={error || 'Customer not found'}>
              Error
            </TooltipCardTitle>
          </CardHeader>
          <CardContent>
            <Link 
              href="/customers" 
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Customers</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href="/customers" 
          className="mr-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <Users className="h-4 w-4" />
          <span>Customers</span>
        </Link>
        <h1 className="text-3xl font-bold">Edit Customer</h1>
      </div>
      
      <Card>
        <CardHeader>
          <TooltipCardTitle tooltip="Update customer information. Only Name and Phone Number are required.">
            Customer Details
          </TooltipCardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full max-w-md mx-auto">
            <CustomerEditForm 
              customer={customer} 
              onCustomerUpdated={handleCustomerUpdated} 
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// No longer needed as we're importing the component directly