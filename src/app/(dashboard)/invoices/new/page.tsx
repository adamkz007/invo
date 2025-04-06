'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false to prevent server rendering issues
const InvoiceFormEnhanced = dynamic(
  () => import('@/components/invoices/invoice-form-enhanced').then(mod => mod.default),
  {
    loading: () => <div className="py-8 text-center">Loading form...</div>,
    ssr: false // Disable server-side rendering to avoid hydration issues
  }
);

export default function NewInvoicePage() {
  // Get customerId from URL query parameters
  const searchParams = useSearchParams();
  const customerId = searchParams.get('customerId');
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href="/invoices" 
          className="mr-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to invoices
        </Link>
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
          <CardDescription>
            Create a new invoice for your customer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-8 text-center">Loading form...</div>}>
            <InvoiceFormEnhanced preSelectedCustomerId={customerId} />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
}
