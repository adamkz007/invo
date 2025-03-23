'use client';

import React, { Suspense, useState, useEffect } from 'react';
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
  Receipt
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, format, formatRelativeDate, calculateDueDays } from '@/lib/utils';
import { downloadInvoicePDF, downloadReceiptPDF } from '@/lib/pdf-generator';
import { InvoiceWithDetails } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { PLAN_LIMITS } from '@/lib/stripe';

// Define company details interface
interface CompanyDetails {
  legalName: string;
  ownerName: string;
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
}

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
const extractPaidAmount = (invoice: InvoiceWithDetails): number => {
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

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  const { settings } = useSettings();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceWithDetails | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [userSubscription, setUserSubscription] = useState<string>('FREE');
  const [invoicesThisMonth, setInvoicesThisMonth] = useState<number>(0);

  // Add theme hook to detect dark mode
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Fetch company details
  useEffect(() => {
    async function fetchCompanyDetails() {
      try {
        const response = await fetch('/api/company');
        
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setCompanyDetails(data);
          }
        }
      } catch (error) {
        console.error('Error fetching company details:', error);
        showToast({
          variant: 'error',
          message: 'Failed to load company details'
        });
      }
    }
    
    fetchCompanyDetails();
  }, [showToast]);

  // Fetch user subscription status
  useEffect(() => {
    async function fetchUserSubscription() {
      try {
        const response = await fetch('/api/user/me', {
          cache: 'no-store',
          next: { revalidate: 0 }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        setUserSubscription(data.subscriptionStatus || 'FREE');
      } catch (err) {
        console.error('Error fetching user data:', err);
      }
    }
    
    fetchUserSubscription();
  }, []);

  const handleViewInvoice = (invoice: InvoiceWithDetails) => {
    // Ensure we fetch the complete invoice with items
    fetch(`/api/invoices/${invoice.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch complete invoice details');
        }
        return response.json();
      })
      .then(data => {
        // Update the selected invoice with complete data
        setSelectedInvoice(data);
      })
      .catch(error => {
        console.error('Error fetching complete invoice:', error);
        showToast({
          variant: 'error',
          message: 'Could not load invoice details'
        });
      });
  };

  const handleDownloadPDF = (invoice: InvoiceWithDetails) => {
    // Fetch full invoice details with items before generating PDF
    fetch(`/api/invoices/${invoice.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch complete invoice details for PDF');
        }
        return response.json();
      })
      .then(completeInvoice => {
        // Pass complete invoice data with items to the PDF generator
        downloadInvoicePDF(completeInvoice, companyDetails);
      })
      .catch(error => {
        console.error('Error fetching invoice for PDF:', error);
        showToast({
          variant: 'error',
          message: 'Could not generate PDF with complete data'
        });
        // Fall back to using the original invoice data
        downloadInvoicePDF(invoice, companyDetails);
      });
  };

  const handleGenerateReceipt = (invoice: InvoiceWithDetails) => {
    // Fetch full invoice details with items before generating receipt
    fetch(`/api/invoices/${invoice.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch complete invoice details for receipt');
        }
        return response.json();
      })
      .then(completeInvoice => {
        // Pass complete invoice data with items to the receipt generator
        downloadReceiptPDF(completeInvoice, companyDetails, settings);
      })
      .catch(error => {
        console.error('Error fetching invoice for receipt:', error);
        showToast({
          variant: 'error',
          message: 'Could not generate receipt with complete data'
        });
        // Fall back to using the original invoice data
        downloadReceiptPDF(invoice, companyDetails, settings);
      });
  };

  const handleCancelInvoice = async (invoice: InvoiceWithDetails) => {
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

  const handleOpenPaymentDialog = (invoice: InvoiceWithDetails) => {
    setSelectedInvoiceForPayment(invoice);
    setPaymentAmount(invoice.total.toString());
    setPaymentDialogOpen(true);
  };

  const handleApplyPayment = async () => {
    if (!selectedInvoiceForPayment) return;
    
    try {
      const response = await fetch(`/api/invoices/${selectedInvoiceForPayment.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'payment',
          paymentAmount: parseFloat(paymentAmount)
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to apply payment');
      }

      // Close the dialog and reset state
      setPaymentDialogOpen(false);
      setSelectedInvoiceForPayment(null);
      setPaymentAmount('');
      
      // Refresh the page to show updated data
      router.refresh();
      
      showToast({
        variant: 'success',
        message: 'Payment applied successfully'
      });
    } catch (error) {
      console.error('Error applying payment:', error);
      showToast({
        variant: 'error',
        message: 'Failed to apply payment'
      });
    }
  };

  const handleMarkAsSent = async (invoice: InvoiceWithDetails) => {
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

      <Suspense fallback={
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
            <p>Loading invoices...</p>
          </div>
        </div>
      }>
        <InvoicesList 
          searchTerm={searchTerm} 
          onViewInvoice={handleViewInvoice} 
          onDownloadPDF={handleDownloadPDF}
          onCancelInvoice={handleCancelInvoice}
          onApplyPayment={handleOpenPaymentDialog}
          onMarkAsSent={handleMarkAsSent}
          onGenerateReceipt={handleGenerateReceipt}
          companyDetails={companyDetails}
          onCountInvoices={(count) => setInvoicesThisMonth(count)}
        />
      </Suspense>

      {/* Invoice Details Dialog */}
      <Dialog open={selectedInvoice !== null} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[90vh] sm:max-h-[85vh]">
          <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Information */}
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-muted-foreground">Bill To:</h3>
              <p className="font-medium">{selectedInvoice?.customer.name}</p>
              {selectedInvoice?.customer.email && (
                <p className="text-sm text-muted-foreground">{selectedInvoice.customer.email}</p>
              )}
              {selectedInvoice?.customer.phoneNumber && (
                <p className="text-sm text-muted-foreground">{selectedInvoice.customer.phoneNumber}</p>
              )}
              {selectedInvoice?.customer.address && (
                <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedInvoice.customer.address}</p>
              )}
            </div>
            
            {/* Invoice Information */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Invoice #{selectedInvoice?.invoiceNumber}</h2>
                {getStatusBadge(selectedInvoice?.status || '', true)}
              </div>
              <div className="flex flex-col gap-1 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Issued: {selectedInvoice ? format(new Date(selectedInvoice.issueDate), 'MMMM d, yyyy') : ''}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {selectedInvoice ? format(new Date(selectedInvoice.dueDate), 'MMMM d, yyyy') : ''}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="mt-4 p-3 bg-muted/50 rounded-md">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold">From:</h3>
              <span className="font-medium">{companyDetails?.legalName || 'Your Company'}</span>
            </div>
            {companyDetails?.email && (
              <p className="text-xs text-muted-foreground">{companyDetails.email}</p>
            )}
            {companyDetails?.phoneNumber && (
              <p className="text-xs text-muted-foreground">{companyDetails.phoneNumber}</p>
            )}
            {companyDetails?.address && (
              <p className="text-xs text-muted-foreground">{companyDetails.address}</p>
            )}
          </div>

          {/* Invoice Items */}
          <div className="border rounded-md overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="text-right">Qty</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice?.items?.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                        {item.description && (
                          <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(item.unitPrice, settings)}</TableCell>
                      <TableCell className="text-right font-bold">{formatCurrency(item.quantity * item.unitPrice, settings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Totals */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Subtotal:</span>
              <span>{formatCurrency(selectedInvoice?.subtotal || 0, settings)}</span>
            </div>
            
            {selectedInvoice && selectedInvoice.taxRate > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span>Tax ({selectedInvoice.taxRate}%):</span>
                <span>{formatCurrency(selectedInvoice.taxAmount || 0, settings)}</span>
              </div>
            )}
            
            {selectedInvoice && selectedInvoice.discountRate > 0 && (
              <div className="flex justify-between items-center text-sm">
                <span>Discount ({selectedInvoice.discountRate}%):</span>
                <span>-{formatCurrency(selectedInvoice.discountAmount || 0, settings)}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
              <span>Total:</span>
              <span>{formatCurrency(selectedInvoice?.total || 0, settings)}</span>
            </div>
            
            {selectedInvoice && extractPaidAmount(selectedInvoice) > 0 && (
              <>
                <div className="flex justify-between items-center text-sm text-green-600">
                  <span>Paid:</span>
                  <span>{formatCurrency(extractPaidAmount(selectedInvoice), settings)}</span>
                </div>
                
                <div className="flex justify-between items-center font-bold">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(selectedInvoice.total - extractPaidAmount(selectedInvoice), settings)}</span>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Thank you for your business!</p>
            <div className="flex items-center justify-center mt-2">
              <span>Powered by</span>
              <div className="flex items-center ml-1">
                <Image src={isDarkMode ? "/invo-logo-w.png" : "/invo-logo.png"} alt="Invo Logo" className="h-4 w-4 mr-1" width={16} height={16} />
                <span className="font-semibold">Invo</span>
              </div>
            </div>
          </div>
          
          {/* Download PDF Button */}
          {selectedInvoice && (
            <div className="flex justify-center mt-6">
              <Button 
                onClick={() => handleDownloadPDF(selectedInvoice)}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

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
                      min="0.01"
                      max={selectedInvoiceForPayment.total}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleApplyPayment}>
              Apply Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Client-side component for Invoices List
function InvoicesList({ 
  searchTerm, 
  onViewInvoice, 
  onDownloadPDF,
  onCancelInvoice,
  onApplyPayment,
  onMarkAsSent,
  onGenerateReceipt,
  companyDetails,
  onCountInvoices
}: { 
  searchTerm: string, 
  onViewInvoice: (invoice: InvoiceWithDetails) => void,
  onDownloadPDF: (invoice: InvoiceWithDetails) => void,
  onCancelInvoice: (invoice: InvoiceWithDetails) => void,
  onApplyPayment: (invoice: InvoiceWithDetails) => void,
  onMarkAsSent: (invoice: InvoiceWithDetails) => void,
  onGenerateReceipt: (invoice: InvoiceWithDetails) => void,
  companyDetails: CompanyDetails | null,
  onCountInvoices: (count: number) => void
}) {
  const [invoices, setInvoices] = useState<InvoiceWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'card' | 'table'>('table');
  const { settings } = useSettings();

  // Fetch invoices on component mount
  useEffect(() => {
    async function fetchInvoices() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/invoices', { 
          cache: 'no-store',
          next: { revalidate: 0 }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch invoices');
        }

        const data = await response.json();
        setInvoices(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchInvoices();
  }, []);

  // Track current month invoices and pass up to parent component
  useEffect(() => {
    if (invoices.length > 0) {
      const now = new Date();
      const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      const thisMonthInvoices = invoices.filter(invoice => 
        new Date(invoice.issueDate) >= firstDayOfMonth
      ).length;
      
      // Use function from parent component to update count
      onCountInvoices(thisMonthInvoices);
    }
  }, [invoices, onCountInvoices]);

  // Filter invoices based on search term
  const filteredInvoices = invoices.filter(invoice => 
    invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary mx-auto"></div>
        <p>Loading invoices...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className="bg-red-50 p-4 rounded-md text-red-800">
      <p className="font-medium">Error loading invoices</p>
      <p className="text-sm">{error}</p>
    </div>
  );

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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {filteredInvoices?.map((invoice) => (
            <Card key={invoice.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="p-3 border-b">
                  <div className="flex justify-between items-start mb-1">
                    <div>
                      <h3 className="font-medium text-sm">{invoice.invoiceNumber}</h3>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Calendar className="mr-1 h-3 w-3" />
                        {format(invoice.issueDate, 'PP')}
                      </div>
                      <div className="flex items-center text-xs mt-0.5">
                        <span className="text-muted-foreground mr-1">Due:</span>
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
                    {getStatusBadge(invoice.status, true)}
                  </div>
                  <div className="flex items-center mt-1 text-xs">
                    <User className="mr-1 h-3 w-3 text-muted-foreground" />
                    <span className="truncate">{invoice.customer.name}</span>
                  </div>
                </div>
                <div className="p-3 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-muted-foreground">Amount</div>
                    <div className="font-bold text-base flex items-center">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      {formatCurrency(invoice.total, settings).replace('$', '')}
                    </div>
                    {(invoice.status as string) === 'PARTIAL' && (
                      <div className="text-xs text-green-600">
                        Paid: {formatCurrency(extractPaidAmount(invoice), settings)}
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onViewInvoice(invoice)}
                      className="h-7 w-7"
                    >
                      <FileText className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => onDownloadPDF(invoice)}
                      className="h-7 w-7"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {invoice.status === 'DRAFT' && (
                          <DropdownMenuItem onSelect={() => onMarkAsSent(invoice)}>
                            <Send className="mr-2 h-4 w-4" /> Mark as Sent
                          </DropdownMenuItem>
                        )}
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <DropdownMenuItem onSelect={() => onApplyPayment(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" /> Apply Payment
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'PAID' && (
                          <DropdownMenuItem onSelect={() => onGenerateReceipt(invoice)}>
                            <Receipt className="mr-2 h-4 w-4" /> Generate Receipt
                          </DropdownMenuItem>
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
                <TableHead className="w-[180px]">Dates</TableHead>
                <TableHead>Total</TableHead>
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
                        {invoice.status !== 'PAID' && invoice.status !== 'CANCELLED' && (
                          <DropdownMenuItem onSelect={() => onApplyPayment(invoice)}>
                            <CreditCard className="mr-2 h-4 w-4" /> Apply Payment
                          </DropdownMenuItem>
                        )}
                        {invoice.status === 'PAID' && (
                          <DropdownMenuItem onSelect={() => onGenerateReceipt(invoice)}>
                            <Receipt className="mr-2 h-4 w-4" /> Generate Receipt
                          </DropdownMenuItem>
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
