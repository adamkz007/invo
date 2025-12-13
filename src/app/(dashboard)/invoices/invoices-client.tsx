'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  Edit, 
  FileText, 
  MoreHorizontal, 
  Plus, 
  Search,
  ArrowUpDown,
  Calendar,
  User,
  DollarSign,
  XCircle,
  CreditCard,
  Send,
  Receipt,
  AlertCircle
} from 'lucide-react';
import { WhatsAppInvoiceButton, WhatsAppFollowUpButton } from '@/components/whatsapp';
import Link from 'next/link';
import { formatCurrency, format, formatRelativeDate, calculateDueDays } from '@/lib/utils';
// Dynamic import for PDF generator to reduce bundle size
// import { downloadInvoicePDF, downloadReceiptPDF } from '@/lib/pdf-generator';
import { formatPhoneNumber } from '@/lib/whatsapp';
import { InvoiceWithDetails } from '@/types';
import type { InvoiceStatus } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { useTheme } from 'next-themes';
import { PLAN_LIMITS } from '@/lib/stripe';
import type { CompanyDetails } from '../dashboard/dashboard-types';
import type { InvoicesClientProps, InvoiceListItem } from './invoices-types';
import dynamic from 'next/dynamic';

const InvoiceDetailsDialog = dynamic(
  () => import('./invoice-details-dialog').then((mod) => mod.InvoiceDetailsDialog),
  {
    loading: () => <div className="p-6 text-center text-sm text-muted-foreground">Loading invoice…</div>,
    ssr: false,
  },
);

// Helper function to get status badge styling - accessible to all components
const getStatusBadge = (status: string, isCompact: boolean = false) => {
  const baseClasses = isCompact 
    ? "px-1.5 py-0.5 text-xs" 
    : "px-2 py-1";
    
  switch (status) {
    case 'PAID':
      return <Badge className={`bg-green-100 text-green-800 hover:bg-green-100 ${baseClasses}`}>Paid</Badge>;
    case 'PARTIAL':
      return <Badge className={`bg-amber-100 text-amber-800 hover:bg-amber-100 ${baseClasses}`}>Partial</Badge>;
    case 'OVERDUE':
      return <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${baseClasses}`}>Overdue</Badge>;
    case 'SENT':
      return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${baseClasses}`}>Sent</Badge>;
    case 'DRAFT':
      return <Badge className={`bg-gray-100 text-gray-800 hover:bg-gray-100 ${baseClasses}`}>Draft</Badge>;
    case 'CANCELLED':
      return <Badge className={`bg-gray-100 text-gray-500 hover:bg-gray-100 ${baseClasses}`}>Cancelled</Badge>;
    default:
      return <Badge variant="outline" className={baseClasses}>{status}</Badge>;
  }
};

// Helper function to extract paid amount from notes
const extractPaidAmount = (invoice: { paidAmount?: number; notes?: string }): number => {
  // First check if paidAmount is directly available
  if (invoice?.paidAmount !== undefined) {
    return invoice.paidAmount;
  }
  
  // If no invoice or no notes, return 0
  if (!invoice || !invoice.notes) return 0;
  
  // Try to extract payment information from notes
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

  // Add theme hook to detect dark mode
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  const paidAmountForSelectedInvoice = selectedInvoiceForPayment
    ? extractPaidAmount(selectedInvoiceForPayment)
    : 0;
  const remainingBalanceForPayment = selectedInvoiceForPayment
    ? Math.max(selectedInvoiceForPayment.total - paidAmountForSelectedInvoice, 0)
    : 0;
  const isPaymentAllowed = remainingBalanceForPayment > 0;
  const parsedPaymentAmount = parseFloat(paymentAmount);
  const isPaymentAmountValid =
    isPaymentAllowed &&
    !Number.isNaN(parsedPaymentAmount) &&
    parsedPaymentAmount > 0 &&
    parsedPaymentAmount <= remainingBalanceForPayment + 0.00001;
  const isPaymentFormValid = isPaymentAmountValid && Boolean(paymentDate);

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
      // Dynamic import of PDF generator to reduce initial bundle size
      const { downloadInvoicePDF } = await import('@/lib/pdf-generator');
      
      const completeInvoice = await fetchInvoiceDetails(invoice.id);
      // Pass complete invoice data with items to the PDF generator
      downloadInvoicePDF(completeInvoice, companyDetails);
    } catch (error) {
      console.error('Error fetching invoice for PDF:', error);
        showToast({
          variant: 'error',
          message: 'Could not generate PDF with complete data'
        });
        // Fallback not available without full invoice details
    }
  };

  const handleGenerateReceipt = async (invoice: InvoiceListItem) => {
    try {
      // First, check if receipts module is enabled and if a receipt already exists for this paid invoice
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
          
          // If a receipt exists for this invoice, download that instead
          if (existingReceipts.length > 0) {
            const existingReceipt = existingReceipts[0]; // Get the first (most recent) receipt
            
            // Dynamic import of PDF generator
            const { downloadReceiptPDF } = await import('@/lib/pdf-generator');
            
            // Download the existing receipt
            downloadReceiptPDF(existingReceipt, companyDetails, settings);
            return;
          }
        }
      }
      
      // If receipts module is disabled, no existing receipt found, or invoice is not paid, generate a new receipt
      // Dynamic import of PDF generator to reduce initial bundle size
      const { downloadReceiptPDF } = await import('@/lib/pdf-generator');
      
      const completeInvoice = await fetchInvoiceDetails(invoice.id);
      // Pass complete invoice data with items to the receipt generator
      downloadReceiptPDF(completeInvoice, companyDetails, settings);
    } catch (error) {
      console.error('Error fetching invoice for receipt:', error);
      showToast({
        variant: 'error',
        message: 'Could not generate receipt with complete data'
      });
      // Fallback not available without full invoice details
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
      // Refresh the page to show updated data
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

      // Close the dialog and reset state
      setPaymentDialogOpen(false);
      setSelectedInvoiceForPayment(null);
      setPaymentAmount('');
      setPaymentDate(getTodayDateString());
      setPaymentMethod('BANK');
      
      // Refresh the page to show updated data
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
      // Refresh the page to show updated data
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

      <div className="flex items-center relative">
        <Search className="absolute left-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search invoices..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full"
        />
      </div>

      <InvoicesList 
        searchTerm={searchTerm} 
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

      {/* Payment Dialog */}
      <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>Apply Payment</DialogTitle>
            <DialogDescription>
              Enter the payment amount for invoice {selectedInvoiceForPayment?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          {selectedInvoiceForPayment && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Invoice Total:</span>
                  <span className="font-medium">{formatCurrency(selectedInvoiceForPayment.total, settings)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Outstanding Balance:</span>
                  <span className="font-medium">
                    {formatCurrency(remainingBalanceForPayment, settings)}
                  </span>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="payment-date" className="text-sm font-medium">
                    Payment Date
                  </label>
                  <Input
                    id="payment-date"
                    type="date"
                    value={paymentDate}
                    max={getTodayDateString()}
                    onChange={(e) => setPaymentDate(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-sm font-medium">Payment Method</label>
                  <Select value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'BANK' | 'CASH')}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BANK">Bank</SelectItem>
                      <SelectItem value="CASH">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="payment-amount" className="text-sm font-medium">
                    Payment Amount
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="payment-amount"
                      type="number"
                      step="0.01"
                      min={isPaymentAllowed ? '0.01' : undefined}
                      max={isPaymentAllowed ? remainingBalanceForPayment : undefined}
                      value={paymentAmount}
                      onChange={(e) => {
                        if (!isPaymentAllowed) {
                          setPaymentAmount('');
                          return;
                        }

                        const { value } = e.target;

                        if (value === '') {
                          setPaymentAmount('');
                          return;
                        }

                        const numericValue = parseFloat(value);

                        if (Number.isNaN(numericValue)) {
                          setPaymentAmount(value);
                          return;
                        }

                        if (numericValue < 0) {
                          setPaymentAmount('');
                          return;
                        }

                        if (numericValue > remainingBalanceForPayment) {
                          setPaymentAmount(remainingBalanceForPayment.toFixed(2));
                          return;
                        }

                        setPaymentAmount(value);
                      }}
                      className="pl-9"
                      disabled={!isPaymentAllowed}
                    />
                  </div>
                  {!isPaymentAllowed && (
                    <p className="text-xs text-muted-foreground">
                      This invoice has been fully paid. No additional payments can be applied.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyPayment} disabled={!isPaymentFormValid}>
              Apply Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Client-side component for Invoices List
interface InvoicesListProps {
  initialInvoices: InvoiceListItem[];
  searchTerm: string;
  onViewInvoice: (invoice: InvoiceListItem) => void;
  onDownloadPDF: (invoice: InvoiceListItem) => void;
  onCancelInvoice: (invoice: InvoiceListItem) => void;
  onApplyPayment: (invoice: InvoiceListItem) => void;
  onMarkAsSent: (invoice: InvoiceListItem) => void;
  onGenerateReceipt: (invoice: InvoiceListItem) => void;
  companyDetails: CompanyDetails | null;
  onCountInvoices: (count: number) => void;
}

function InvoicesList({
  initialInvoices,
  searchTerm,
  onViewInvoice,
  onDownloadPDF,
  onCancelInvoice,
  onApplyPayment,
  onMarkAsSent,
  onGenerateReceipt,
  companyDetails,
  onCountInvoices,
}: InvoicesListProps) {
  const invoices = initialInvoices;
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const { settings } = useSettings();

  const getStatusTone = useCallback((status: string) => {
    switch (status) {
      case 'PAID':
        return { dot: 'bg-green-500', pill: 'bg-green-50 text-green-800', accent: 'from-green-50 to-white' };
      case 'PARTIAL':
        return { dot: 'bg-amber-500', pill: 'bg-amber-50 text-amber-800', accent: 'from-amber-50 to-white' };
      case 'OVERDUE':
        return { dot: 'bg-red-500', pill: 'bg-red-50 text-red-800', accent: 'from-red-50 to-white' };
      case 'SENT':
        return { dot: 'bg-blue-500', pill: 'bg-blue-50 text-blue-800', accent: 'from-blue-50 to-white' };
      case 'DRAFT':
        return { dot: 'bg-slate-400', pill: 'bg-slate-50 text-slate-700', accent: 'from-slate-50 to-white' };
      case 'CANCELLED':
        return { dot: 'bg-slate-300', pill: 'bg-slate-50 text-slate-500', accent: 'from-slate-50 to-white' };
      default:
        return { dot: 'bg-slate-400', pill: 'bg-slate-50 text-slate-700', accent: 'from-slate-50 to-white' };
    }
  }, []);

  const getDueDetails = useCallback((dueDate: Date | string) => {
    const days = calculateDueDays(dueDate);
    if (days < 0) {
      return { label: `Due ${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} ago`, tone: 'text-red-700', chip: 'bg-red-50 text-red-700', icon: <AlertCircle className="h-4 w-4 text-red-600" /> };
    }
    if (days === 0) {
      return { label: 'Due today', tone: 'text-amber-700', chip: 'bg-amber-50 text-amber-700', icon: <AlertCircle className="h-4 w-4 text-amber-600" /> };
    }
    return { label: `Due in ${days} day${days === 1 ? '' : 's'}`, tone: 'text-slate-600', chip: 'bg-slate-50 text-slate-700', icon: <Calendar className="h-4 w-4 text-slate-500" /> };
  }, []);

  // Track current month invoices and pass up to parent component
  useEffect(() => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const thisMonthInvoices = invoices.filter(invoice => {
      const issueDate = new Date(invoice.issueDate);
      return issueDate >= firstDayOfMonth;
    }).length;

    onCountInvoices(thisMonthInvoices);
  }, [invoices, onCountInvoices]);

  // Filter invoices based on search term
  const filteredInvoices = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return invoices.filter(
      (invoice) =>
        invoice.invoiceNumber.toLowerCase().includes(term) ||
        invoice.customer.name.toLowerCase().includes(term),
    );
  }, [invoices, searchTerm]);

  if (filteredInvoices.length === 0) return (
    <div className="text-center py-12 border rounded-lg">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium">No invoices found</h3>
      <p className="text-muted-foreground mb-4">
        {searchTerm ? 'Try a different search term' : 'Create your first invoice to get started'}
      </p>
      {!searchTerm && (
        <Link href="/invoices/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          Showing {filteredInvoices.length} invoice{filteredInvoices.length !== 1 ? 's' : ''}
        </div>
        <div className="flex items-center space-x-2">
          <Button 
            variant={viewMode === 'card' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('card')}
            className="h-8"
          >
            Card View
          </Button>
          <Button 
            variant={viewMode === 'table' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('table')}
            className="h-8"
          >
            Table View
          </Button>
        </div>
      </div>

      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredInvoices?.map((invoice) => (
            <Card
              key={invoice.id}
              className="overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-br dark:from-slate-900 dark:to-slate-900/70"
            >
              <CardContent className="p-4 sm:p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center text-white shadow-inner ${getStatusTone(invoice.status).dot}`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">#{invoice.invoiceNumber}</div>
                      <div className="text-base sm:text-lg font-semibold leading-tight">{invoice.customer.name}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        Issued {format(invoice.issueDate, 'PP')}
                      </div>
                    </div>
                  </div>
                  <div className={getStatusTone(invoice.status).pill + " rounded-full px-3 py-1 text-xs font-semibold inline-flex items-center gap-1"}>
                    <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                    {invoice.status}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {invoice.status === 'DRAFT' ? 'Estimated' : 'Total Amount'}
                    </div>
                    <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {formatCurrency(invoice.total, settings)}
                    </div>
                    {(invoice.status as string) === 'PARTIAL' && (
                      <div className="text-xs text-green-600">
                        Paid {formatCurrency(extractPaidAmount(invoice), settings)} so far
                      </div>
                    )}
                  </div>
                  {(() => {
                    const due = getDueDetails(invoice.dueDate);
                    return (
                      <div className="flex items-center gap-3">
                        <div className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium ${due.chip}`}>
                          {due.icon}
                          <span>{due.label}</span>
                        </div>
                        <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground border rounded-full px-3 py-2">
                          <Calendar className="h-4 w-4" />
                          {format(invoice.dueDate, 'PP')}
                        </div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-dashed border-slate-200">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CreditCard className="h-4 w-4 text-slate-400" />
                    {formatRelativeDate(invoice.dueDate)}
                    <span className="mx-1">•</span>
                    Invoice for {invoice.customer.name}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onViewInvoice(invoice)}
                      aria-label="View invoice"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => onDownloadPDF(invoice)}
                      aria-label="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-9 w-9" aria-label="More actions">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.status === 'DRAFT' && (
                          <DropdownMenuItem onSelect={() => onMarkAsSent(invoice)}>
                            <Send className="mr-2 h-4 w-4" /> Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && invoice.status !== 'DRAFT' && (
                          <DropdownMenuItem onSelect={() => onApplyPayment(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" /> Apply Payment
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'PAID' && (
                          <DropdownMenuItem onSelect={() => onGenerateReceipt(invoice)}>
                            <Receipt className="mr-2 h-4 w-4" /> Generate Receipt
                          </DropdownMenuItem>
                        )}
                        {calculateDueDays(invoice.dueDate) < 0 && invoice.customer.phone && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <WhatsAppFollowUpButton
                            invoice={invoice}
                            companyDetails={companyDetails}
                            reminderType="gentle"
                            asDropdownItem
                          />
                        )}
                        {invoice.status !== 'CANCELLED' && (
                          <DropdownMenuItem onSelect={() => onCancelInvoice(invoice)}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">
                  <div className="flex items-center">
                    Invoice
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </div>
                </TableHead>
                <TableHead>Total</TableHead>
                <TableHead className="w-[180px]">Dates</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices?.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell 
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => onViewInvoice(invoice)}
                  >
                    <div className="space-y-1">
                      <div className="text-xs text-muted-foreground">{invoice.invoiceNumber}</div>
                      <div className="text-base font-medium">{invoice.customer.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-bold">{formatCurrency(invoice.total, settings)}</span>
                      {(invoice.status as string) === 'PARTIAL' && (
                        <div className="text-xs text-green-600">
                          Paid: {formatCurrency(extractPaidAmount(invoice), settings)}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-xs">
                        <span className="text-muted-foreground">Created:</span> {format(invoice.issueDate, 'PP')}
                      </div>
                      <div className="text-xs">
                        <span className="text-muted-foreground">Due:</span>{' '}
                        {(() => {
                          const dueDays = calculateDueDays(invoice.dueDate);
                          if (dueDays > 0) {
                            return <span className="text-muted-foreground font-medium">in {dueDays} days</span>;
                          } else if (dueDays < 0) {
                            return <span className="text-red-600 font-medium">{dueDays} days</span>;
                          } else {
                            return <span className="text-amber-600 font-medium">today</span>;
                          }
                        })()}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(invoice.status, true)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => onViewInvoice(invoice)}>
                          <FileText className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => onDownloadPDF(invoice)}>
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </DropdownMenuItem>
                        {invoice.status === 'DRAFT' && (
                          <DropdownMenuItem onSelect={() => onMarkAsSent(invoice)}>
                            <Send className="mr-2 h-4 w-4" /> Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && invoice.status !== 'DRAFT' && (
                          <DropdownMenuItem onSelect={() => onApplyPayment(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" /> Apply Payment
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'PAID' && (
                          <DropdownMenuItem onSelect={() => onGenerateReceipt(invoice)}>
                            <Receipt className="mr-2 h-4 w-4" /> Generate Receipt
                          </DropdownMenuItem>
                        )}
                        {/* WhatsApp Follow-up for overdue invoices */}
                        {calculateDueDays(invoice.dueDate) < 0 && invoice.customer.phone && invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <WhatsAppFollowUpButton
                            invoice={invoice}
                            companyDetails={companyDetails}
                            reminderType="gentle"
                            asDropdownItem
                          />
                        )}
                        {invoice.status !== 'CANCELLED' && (
                          <DropdownMenuItem onSelect={() => onCancelInvoice(invoice)}>
                            <XCircle className="mr-2 h-4 w-4" /> Cancel Invoice
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
