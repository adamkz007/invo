'use client';

import React, { Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { InlineLoading } from '@/components/ui/loading';
import dynamic from 'next/dynamic';

// Use dynamic import with ssr: false to prevent server rendering issues
const InvoiceFormEnhanced = dynamic(
  () => import('@/components/invoices/invoice-form-enhanced').then(mod => mod.default),
  {
    loading: () => <InlineLoading text="Loading form..." />,
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
          className="mr-4 flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground bg-muted/50 px-2.5 py-1.5 rounded-md transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          <FileText className="h-4 w-4" />
          <span>Invoices</span>
        </Link>
        <h1 className="text-3xl font-bold">Create New Invoice</h1>
      </div>
      <Suspense fallback={<InlineLoading text="Loading form..." />}>
        <InvoiceFormEnhanced preSelectedCustomerId={customerId} />
      </Suspense>
    </div>
  );
}
