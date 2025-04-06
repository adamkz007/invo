'use client';

import React, { Suspense, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useSettings } from '@/contexts/settings-context';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

// Use dynamic import with explicit default export resolution
const ReceiptForm = dynamic(
  () => import('@/components/receipts/receipt-form-enhanced').then(mod => mod.default),
  {
    loading: () => <div className="py-6 text-center">Loading form...</div>,
    ssr: false // Disable server-side rendering to avoid hydration issues
  }
);

export default function NewReceiptPage() {
  const router = useRouter();
  const { settings } = useSettings();
  const { showToast } = useToast();

  // Redirect if receipts module is disabled
  useEffect(() => {
    if (!settings.enableReceiptsModule) {
      router.push('/dashboard');
      showToast({
        variant: 'error',
        message: 'Receipts module is disabled. Enable it in Settings.'
      });
    }
  }, [settings.enableReceiptsModule, router, showToast]);

  // If receipts module is disabled, return null to avoid rendering anything
  if (!settings.enableReceiptsModule) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Link 
          href="/receipts" 
          className="mr-4 flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to receipts
        </Link>
        <h1 className="text-3xl font-bold">Create New Receipt</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Receipt Details</CardTitle>
          <CardDescription>
            Create a new receipt for a quick cash/card payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div className="py-6 text-center">Loading form...</div>}>
            <ReceiptForm />
          </Suspense>
        </CardContent>
      </Card>
    </div>
  );
} 