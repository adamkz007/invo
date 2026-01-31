'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  FileText,
  MoreHorizontal,
  Plus,
  ArrowUpDown,
  XCircle,
  CreditCard,
  Send,
  Receipt
} from 'lucide-react';
import { formatCurrency, format, calculateDueDays } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import type { CompanyDetails } from '../dashboard/dashboard-types';
import type { InvoiceListItem } from './invoices-types';

// Lazy load WhatsApp components - only needed for overdue invoices
const WhatsAppFollowUpButton = dynamic(
  () => import('@/components/whatsapp').then(mod => mod.WhatsAppFollowUpButton),
  { ssr: false, loading: () => null }
);

// Helper function to get status badge styling
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

export interface InvoicesListProps {
  initialInvoices: InvoiceListItem[];
  searchTerm: string;
  statusFilter: string;
  onViewInvoice: (invoice: InvoiceListItem) => void;
  onDownloadPDF: (invoice: InvoiceListItem) => void;
  onCancelInvoice: (invoice: InvoiceListItem) => void;
  onApplyPayment: (invoice: InvoiceListItem) => void;
  onMarkAsSent: (invoice: InvoiceListItem) => void;
  onGenerateReceipt: (invoice: InvoiceListItem) => void;
  companyDetails: CompanyDetails | null;
  onCountInvoices: (count: number) => void;
}

export function InvoicesList({
  initialInvoices,
  searchTerm,
  statusFilter,
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
    const hasSearch = term.length > 0;

    return invoices.filter((invoice) => {
      if (hasSearch) {
        const matchesSearch =
          invoice.invoiceNumber.toLowerCase().includes(term) ||
          invoice.customer.name.toLowerCase().includes(term);
        if (!matchesSearch) return false;
      }

      if (statusFilter !== 'ALL' && invoice.status !== statusFilter) return false;

      return true;
    });
  }, [invoices, searchTerm, statusFilter]);

  if (filteredInvoices.length === 0) {
    const hasAnyFilter = Boolean(searchTerm) || statusFilter !== 'ALL';
    return (
      <div className="text-center py-12 border rounded-lg">
        <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No invoices found</h3>
        <p className="text-muted-foreground mb-4">
          {hasAnyFilter ? 'Try adjusting your filters' : 'Create your first invoice to get started'}
        </p>
        {!hasAnyFilter && (
          <Link href="/invoices/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Create Invoice
            </Button>
          </Link>
        )}
      </div>
    );
  }

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
              <CardContent className="p-3 sm:p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center text-white shadow-inner ${getStatusTone(invoice.status).dot}`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wide text-muted-foreground">#{invoice.invoiceNumber}</div>
                      <div className="text-base sm:text-lg font-semibold leading-tight">{invoice.customer.name}</div>
                    </div>
                  </div>
                  <div className={getStatusTone(invoice.status).pill + " rounded-full px-2.5 py-1 text-[11px] font-semibold inline-flex items-center gap-1"}>
                    <span className="h-2 w-2 rounded-full bg-current opacity-80" />
                    {invoice.status}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="space-y-1">
                    <div className="text-xs text-muted-foreground">
                      {invoice.status === 'DRAFT' ? 'Estimated' : 'Total Amount'}
                    </div>
                    <div className="text-xl sm:text-2xl font-extrabold tracking-tight">
                      {formatCurrency(invoice.total, settings)}
                    </div>
                    {(invoice.status as string) === 'PARTIAL' && (
                      <div className="text-xs text-green-600">
                        Paid {formatCurrency(extractPaidAmount(invoice), settings)} so far
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-end pt-2 border-t border-dashed border-slate-200">
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onViewInvoice(invoice)}
                      aria-label="View invoice"
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onDownloadPDF(invoice)}
                      aria-label="Download PDF"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More actions">
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

// Export extractPaidAmount for use in parent component
export { extractPaidAmount };
