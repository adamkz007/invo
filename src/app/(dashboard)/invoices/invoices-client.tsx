'use client';

import React, { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
// Import from plan-limits instead of stripe to avoid loading Stripe SDK on client
import { PLAN_LIMITS } from '@/lib/plan-limits';
import type { InvoiceDetailResponseDto } from '@/lib/dto/invoices';
import type { CompanyDetails } from '../dashboard/dashboard-types';
import type { InvoicesClientProps, InvoiceListItem } from './invoices-types';
import { useInvoiceDetailsCache } from './use-invoice-details-cache';
import { useInvoiceActions } from './use-invoice-actions';
import { toPdfInvoice } from './invoice-pdf-adapter';
import { emitInvoiceMetric } from './invoice-performance';

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


export function InvoicesClient({
  initialInvoices,
  initialCompany,
  initialSubscription,
  initialInvoicesThisMonth,
}: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<InvoiceListItem[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetailResponseDto | null>(null);
  const [invoicesThisMonth, setInvoicesThisMonth] = useState<number>(initialInvoicesThisMonth);
  const companyDetails = initialCompany;
  const userSubscription = initialSubscription;
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { fetchInvoiceDetails, invalidateInvoiceDetails } = useInvoiceDetailsCache();
  const patchInvoiceInList = useCallback((invoiceId: string, patch: Partial<InvoiceListItem>) => {
    setInvoices((current) =>
      current.map((invoice) => (invoice.id === invoiceId ? { ...invoice, ...patch } : invoice)),
    );
  }, []);

  const {
    paymentDialogOpen,
    setPaymentDialogOpen,
    selectedInvoiceForPayment,
    paymentAmount,
    setPaymentAmount,
    paymentDate,
    setPaymentDate,
    paymentMethod,
    setPaymentMethod,
    handleCancelInvoice,
    handleMarkAsSent,
    handleOpenPaymentDialog,
    handleApplyPayment,
  } = useInvoiceActions({
    showToast,
    invalidateInvoiceDetails,
    onInvoicePatched: patchInvoiceInList,
  });

  const handleViewInvoice = async (invoice: InvoiceListItem) => {
    const start = performance.now();
    try {
      const data = await fetchInvoiceDetails(invoice.id);
      emitInvoiceMetric({
        name: 'invoice_detail_fetch_ms',
        value: Number((performance.now() - start).toFixed(1)),
        id: invoice.id,
        startTime: Date.now(),
        label: 'invoice-details',
      });
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
    const start = performance.now();
    try {
      const { downloadInvoicePDF } = await import('@/lib/pdf-generator');
      const completeInvoice = await fetchInvoiceDetails(invoice.id);
      downloadInvoicePDF(toPdfInvoice(completeInvoice), companyDetails, settings);
      emitInvoiceMetric({
        name: 'invoice_pdf_trigger_ms',
        value: Number((performance.now() - start).toFixed(1)),
        id: invoice.id,
        startTime: Date.now(),
        label: 'invoice-list',
      });
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
      downloadReceiptPDF(toPdfInvoice(completeInvoice), companyDetails, settings);
    } catch (error) {
      console.error('Error fetching invoice for receipt:', error);
      showToast({
        variant: 'error',
        message: 'Could not generate receipt with complete data'
      });
    }
  };

  const handleDownloadPDFWithDetails = useCallback(
    async (invoice: InvoiceDetailResponseDto) => {
      const start = performance.now();
      const { downloadInvoicePDF } = await import('@/lib/pdf-generator');
      downloadInvoicePDF(toPdfInvoice(invoice), companyDetails, settings);
      emitInvoiceMetric({
        name: 'invoice_pdf_trigger_ms',
        value: Number((performance.now() - start).toFixed(1)),
        id: invoice.id,
        startTime: Date.now(),
        label: 'invoice-dialog',
      });
    },
    [companyDetails, settings],
  );

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
        initialInvoices={invoices}
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
