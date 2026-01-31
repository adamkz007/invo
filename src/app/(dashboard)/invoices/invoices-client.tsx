'use client';

import React, { useState, useMemo, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { formatPhoneNumber } from '@/lib/whatsapp';
import { InvoiceWithDetails } from '@/types';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { useTheme } from 'next-themes';
// Import from plan-limits instead of stripe to avoid loading Stripe SDK on client
import { PLAN_LIMITS } from '@/lib/plan-limits';
import type { CompanyDetails } from '../dashboard/dashboard-types';
import type { InvoicesClientProps, InvoiceListItem } from './invoices-types';

// Dynamic imports to reduce initial bundle size
const InvoicesList = dynamic(
  () => import('./invoices-list').then(mod => mod.InvoicesList),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="h-10 bg-muted animate-pulse rounded" />
        <div className="h-64 bg-muted animate-pulse rounded" />
      </div>
    ),
    ssr: false,
  }
);

const InvoiceDetailsDialog = dynamic(
  () => import('./invoice-details-dialog').then((mod) => mod.InvoiceDetailsDialog),
  {
    loading: () => <div className="p-6 text-center text-sm text-muted-foreground">Loading invoice…</div>,
    ssr: false,
  },
);

const PaymentDialog = dynamic(
  () => import('./payment-dialog').then(mod => mod.PaymentDialog),
  {
    loading: () => null,
    ssr: false,
  }
);

// Helper function to extract paid amount from notes
const extractPaidAmount = (invoice: { paidAmount?: number; notes?: string }): number => {
  if (invoice?.paidAmount !== undefined) {
    return invoice.paidAmount;
  }
  if (!invoice || !invoice.notes) return 0;
  try {
    const paymentRegex = /Payment of ([\d.]+) received/;
    const matches = invoice.notes.match(paymentRegex);
    if (matches && matches[1]) {
      return parseFloat(matches[1]);
    }
  } catch (error) {
    console.error('Error extracting payment amount:', error);
  }
  return 0;
};

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

export function InvoicesClient({
  initialInvoices,
  initialCompany,
  initialSubscription,
  initialInvoicesThisMonth,
}: InvoicesClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceListItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayDateString);
  const [paymentMethod, setPaymentMethod] = useState<'BANK' | 'CASH'>('BANK');
  const [invoicesThisMonth, setInvoicesThisMonth] = useState<number>(initialInvoicesThisMonth);
  const invoiceDetailsRef = useRef<Record<string, InvoiceWithDetails>>({});
  const companyDetails = initialCompany;
  const userSubscription = initialSubscription;
  const { showToast } = useToast();
  const router = useRouter();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const selectedInvoiceWhatsAppDetails = useMemo(() => {
    if (!selectedInvoice) return null;

    const phoneNumber = formatPhoneNumber(selectedInvoice.customer.phoneNumber || '');
    if (!phoneNumber) return null;

    const formattedTotal = formatCurrency(selectedInvoice.total, settings);
    const businessName = companyDetails?.legalName || 'your business';
    const message = `Hello ${selectedInvoice.customer.name}! Here's your invoice totalling ${formattedTotal} from ${businessName}`;
    const whatsappUrl = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(message)}`;

    return { phoneNumber, whatsappUrl };
  }, [companyDetails?.legalName, selectedInvoice, settings]);

  const invalidateInvoiceDetails = useCallback((invoiceId: string) => {
    delete invoiceDetailsRef.current[invoiceId];
  }, []);

  const fetchInvoiceDetails = useCallback(
    async (invoiceId: string) => {
      const cached = invoiceDetailsRef.current[invoiceId];
      if (cached) {
        return cached;
      }

      const response = await fetch(`/api/invoices/${invoiceId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch complete invoice details');
      }

      const data: InvoiceWithDetails = await response.json();
      invoiceDetailsRef.current[invoiceId] = data;
      return data;
    },
    [],
  );

  const handleViewInvoice = async (invoice: InvoiceListItem) => {
    try {
      const data = await fetchInvoiceDetails(invoice.id);
      setSelectedInvoice(data);
    } catch (error) {
      console.error('Error fetching complete invoice:', error);
      showToast({
        variant: 'error',
        message: 'Could not load invoice details',
      });
    }
  };

  const handleDownloadPDF = async (invoice: InvoiceListItem) => {
    try {
      const { downloadInvoicePDF } = await import('@/lib/pdf-generator');
      const completeInvoice = await fetchInvoiceDetails(invoice.id);
      downloadInvoicePDF(completeInvoice, companyDetails);
    } catch (error) {
      console.error('Error fetching invoice for PDF:', error);
      showToast({
        variant: 'error',
        message: 'Could not generate PDF with complete data'
      });
    }
  };

  const handleGenerateReceipt = async (invoice: InvoiceListItem) => {
    try {
      if (settings.enableReceiptsModule && invoice.status === 'PAID') {
        const receiptsResponse = await fetch(`/api/receipts?invoiceId=${invoice.invoiceNumber}`, {
          headers: {
            'x-receipts-module-enabled': 'true'
          }
        });

        if (receiptsResponse.ok) {
          const receiptsPayload = await receiptsResponse.json();
          const existingReceipts = Array.isArray(receiptsPayload)
            ? receiptsPayload
            : Array.isArray(receiptsPayload?.data)
              ? receiptsPayload.data
              : [];

          if (existingReceipts.length > 0) {
            const existingReceipt = existingReceipts[0];
            const { downloadReceiptPDF } = await import('@/lib/pdf-generator');
            downloadReceiptPDF(existingReceipt, companyDetails, settings);
            return;
          }
        }
      }

      const { downloadReceiptPDF } = await import('@/lib/pdf-generator');
      const completeInvoice = await fetchInvoiceDetails(invoice.id);
      downloadReceiptPDF(completeInvoice, companyDetails, settings);
    } catch (error) {
      console.error('Error fetching invoice for receipt:', error);
      showToast({
        variant: 'error',
        message: 'Could not generate receipt with complete data'
      });
    }
  };

  const handleDownloadPDFWithDetails = useCallback(
    async (invoice: InvoiceWithDetails) => {
      const { downloadInvoicePDF } = await import('@/lib/pdf-generator');
      downloadInvoicePDF(invoice, companyDetails);
    },
    [companyDetails],
  );

  const handleCancelInvoice = async (invoice: InvoiceListItem) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'cancel'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to cancel invoice');
      }

      invalidateInvoiceDetails(invoice.id);
      router.refresh();

      showToast({
        variant: 'success',
        message: 'Invoice cancelled successfully'
      });
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      showToast({
        variant: 'error',
        message: 'Failed to cancel invoice'
      });
    }
  };

  const handleOpenPaymentDialog = (invoice: InvoiceListItem) => {
    if (invoice.status === 'DRAFT') {
      showToast({
        variant: 'error',
        message: 'Mark the invoice as sent before applying a payment.',
      });
      return;
    }

    const invoicePaidAmount = extractPaidAmount(invoice);
    const outstandingAmount = Math.max(invoice.total - invoicePaidAmount, 0);

    setSelectedInvoiceForPayment(invoice);
    setPaymentAmount(outstandingAmount > 0 ? outstandingAmount.toFixed(2) : '');
    setPaymentDate(getTodayDateString());
    setPaymentMethod('BANK');
    setPaymentDialogOpen(true);
  };

  const handleApplyPayment = async () => {
    if (!selectedInvoiceForPayment) return;

    const invoicePaidAmount = extractPaidAmount(selectedInvoiceForPayment);
    const outstandingAmount = Math.max(selectedInvoiceForPayment.total - invoicePaidAmount, 0);
    const parsedAmount = parseFloat(paymentAmount);

    if (outstandingAmount <= 0) {
      showToast({
        variant: 'error',
        message: 'This invoice has no outstanding balance.'
      });
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast({
        variant: 'error',
        message: 'Enter a valid payment amount greater than zero.'
      });
      return;
    }

    if (parsedAmount > outstandingAmount) {
      showToast({
        variant: 'error',
        message: 'Payment amount cannot exceed the outstanding balance.'
      });
      return;
    }

    const normalizedAmount = Number(parsedAmount.toFixed(2));

    try {
      const response = await fetch(`/api/invoices/${selectedInvoiceForPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'payment',
          paymentAmount: normalizedAmount,
          paymentDate,
          paymentMethod,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = (errorData as { error?: string } | null)?.error || 'Failed to apply payment';
        throw new Error(errorMessage);
      }

      setPaymentDialogOpen(false);
      setSelectedInvoiceForPayment(null);
      setPaymentAmount('');
      setPaymentDate(getTodayDateString());
      setPaymentMethod('BANK');

      router.refresh();
      invalidateInvoiceDetails(selectedInvoiceForPayment.id);

      showToast({
        variant: 'success',
        message: 'Payment applied successfully'
      });
    } catch (error) {
      console.error('Error applying payment:', error);
      const message = error instanceof Error ? error.message : 'Failed to apply payment';
      showToast({
        variant: 'error',
        message,
      });
    }
  };

  const handleMarkAsSent = async (invoice: InvoiceListItem) => {
    try {
      const response = await fetch(`/api/invoices/${invoice.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'mark_sent'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to mark invoice as sent');
      }

      invalidateInvoiceDetails(invoice.id);
      router.refresh();

      showToast({
        variant: 'success',
        message: 'Invoice marked as sent'
      });
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
      showToast({
        variant: 'error',
        message: 'Failed to mark invoice as sent'
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          {userSubscription === 'FREE' && (
            <p className="text-muted-foreground mt-1">
              Used {invoicesThisMonth} of {PLAN_LIMITS.FREE.invoicesPerMonth} invoices this month
              {invoicesThisMonth >= PLAN_LIMITS.FREE.invoicesPerMonth && (
                <span className="ml-2 text-orange-500 font-medium">
                  (Limit reached - <Link href="/settings" className="underline">upgrade</Link> for unlimited)
                </span>
              )}
            </p>
          )}
        </div>
        <Button asChild>
          <Link href="/invoices/new">
            <Plus className="mr-2 h-4 w-4" />
            New Invoice
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center relative sm:col-span-2">
          <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search invoices..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full"
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="PARTIAL">Partial</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <InvoicesList
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        initialInvoices={initialInvoices}
        onViewInvoice={handleViewInvoice}
        onDownloadPDF={handleDownloadPDF}
        onCancelInvoice={handleCancelInvoice}
        onApplyPayment={handleOpenPaymentDialog}
        onMarkAsSent={handleMarkAsSent}
        onGenerateReceipt={handleGenerateReceipt}
        companyDetails={companyDetails}
        onCountInvoices={setInvoicesThisMonth}
      />

      <InvoiceDetailsDialog
        invoice={selectedInvoice}
        companyDetails={companyDetails}
        settings={settings}
        isDarkMode={isDarkMode}
        onClose={() => setSelectedInvoice(null)}
        onDownloadPDF={handleDownloadPDFWithDetails}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        invoice={selectedInvoiceForPayment}
        paymentAmount={paymentAmount}
        onPaymentAmountChange={setPaymentAmount}
        paymentDate={paymentDate}
        onPaymentDateChange={setPaymentDate}
        paymentMethod={paymentMethod}
        onPaymentMethodChange={setPaymentMethod}
        onSubmit={handleApplyPayment}
      />
    </div>
  );
}
