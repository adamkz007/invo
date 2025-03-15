'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import InvoiceFormEnhanced from '@/components/invoices/invoice-form-enhanced';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewInvoicePage() {
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
          <InvoiceFormEnhanced />
        </CardContent>
      </Card>
    </div>
  );
}
