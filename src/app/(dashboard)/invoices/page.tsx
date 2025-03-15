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
  DialogTitle
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
  DollarSign
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, format, formatRelativeDate, calculateDueDays } from '@/lib/utils';
import { downloadInvoicePDF } from '@/lib/pdf-generator';
import { InvoiceWithDetails } from '@/types';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';

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
    case 'OVERDUE':
      return <Badge className={`bg-red-100 text-red-800 hover:bg-red-100 ${baseClasses}`}>Overdue</Badge>;
    case 'SENT':
      return <Badge className={`bg-blue-100 text-blue-800 hover:bg-blue-100 ${baseClasses}`}>Sent</Badge>;
    case 'DRAFT':
      return <Badge className={`bg-gray-100 text-gray-800 hover:bg-gray-100 ${baseClasses}`}>Draft</Badge>;
    default:
      return <Badge variant="outline" className={baseClasses}>{status}</Badge>;
  }
};

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const { showToast } = useToast();
  const router = useRouter();
  const { settings } = useSettings();

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

  const handleViewInvoice = (invoice: InvoiceWithDetails) => {
    setSelectedInvoice(invoice);
  };

  const handleDownloadPDF = (invoice: InvoiceWithDetails) => {
    // Pass company details to the PDF generator
    downloadInvoicePDF(invoice, companyDetails);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold">Invoices</h1>
        <Link href="/invoices/new">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Create Invoice
          </Button>
        </Link>
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
          companyDetails={companyDetails}
        />
      </Suspense>

      {/* Invoice Details Dialog */}
      <Dialog open={selectedInvoice !== null} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-xl w-full mx-auto p-6 space-y-6">
          <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          <div className="grid grid-cols-2 gap-4">
            {/* Company Header */}
            <div>
              <h2 className="text-2xl font-bold text-primary">
                {companyDetails?.legalName || 'Invo Solutions'}
              </h2>
              {companyDetails?.address && (
                <p className="text-sm text-muted-foreground">{companyDetails.address}</p>
              )}
              {companyDetails?.email && (
                <p className="text-sm text-muted-foreground">{companyDetails.email}</p>
              )}
              {companyDetails?.phoneNumber && (
                <p className="text-sm text-muted-foreground">{companyDetails.phoneNumber}</p>
              )}
              {!companyDetails && (
                <>
                  <p className="text-sm text-muted-foreground">123 Business Street</p>
                  <p className="text-sm text-muted-foreground">Silicon Valley, CA 94000</p>
                  <p className="text-sm text-muted-foreground">contact@invo.com</p>
                </>
              )}
            </div>

            {/* Invoice Details */}
            <div className="text-right">
              <h1 className="text-3xl font-extrabold">INVOICE</h1>
              <p className="text-sm mt-2">
                <span className="font-semibold">Invoice #:</span> {selectedInvoice?.invoiceNumber}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Issue Date:</span> {selectedInvoice ? format(selectedInvoice.issueDate, 'PP') : ''}
              </p>
              <p className="text-sm">
                <span className="font-semibold">Due Date:</span> {selectedInvoice ? format(selectedInvoice.dueDate, 'PP') : ''}
              </p>
              <div className="flex justify-end mt-2">
                <span className="font-semibold mr-2">Status:</span>
                {selectedInvoice && getStatusBadge(selectedInvoice.status, true)}
              </div>
            </div>
          </div>

          {/* Customer Details */}
          <div className="border-t border-b py-4 my-4">
            <h3 className="text-lg font-semibold mb-2">Bill To</h3>
            <p className="font-bold">{selectedInvoice?.customer.name}</p>
            <p className="text-muted-foreground">{selectedInvoice?.customer.email}</p>
          </div>

          {/* Invoice Items */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Quantity</TableHead>
                <TableHead className="text-right">Unit Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selectedInvoice?.items.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <div>{item.product.name}</div>
                    {item.product.description && (
                      <div className="text-xs text-muted-foreground">{item.product.description}</div>
                    )}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.unitPrice, settings)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice, settings)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Totals */}
          <div className="ml-auto max-w-xs w-full space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>{selectedInvoice ? formatCurrency(selectedInvoice.subtotal, settings) : ''}</span>
            </div>
            {selectedInvoice && selectedInvoice.taxRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax ({selectedInvoice.taxRate}%)</span>
                <span>{formatCurrency(selectedInvoice.taxAmount, settings)}</span>
              </div>
            )}
            {selectedInvoice && selectedInvoice.discountRate > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Discount ({selectedInvoice.discountRate}%)</span>
                <span>-{formatCurrency(selectedInvoice.discountAmount, settings)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base pt-2 mt-1 border-t">
              <span>Total</span>
              <span>{selectedInvoice ? formatCurrency(selectedInvoice.total, settings) : ''}</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground mt-4">
            <p>Thank you for your business!</p>
            <div className="flex items-center justify-center mt-2">
              <span>Powered by</span>
              <div className="flex items-center ml-1">
                <img src="/invo-logo.png" alt="Invo Logo" className="h-4 w-4 mr-1" />
                <span className="font-semibold">Invo</span>
              </div>
            </div>
          </div>
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
  companyDetails
}: { 
  searchTerm: string, 
  onViewInvoice: (invoice: InvoiceWithDetails) => void,
  onDownloadPDF: (invoice: InvoiceWithDetails) => void,
  companyDetails: CompanyDetails | null
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
          {filteredInvoices.map((invoice) => (
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
                    <Link href={`/invoices/edit/${invoice.id}`}>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
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
              {filteredInvoices.map((invoice) => (
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
                    <span className="font-bold">{formatCurrency(invoice.total, settings)}</span>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/invoices/edit/${invoice.id}`}>
                            <Edit className="mr-2 h-4 w-4" /> Edit Invoice
                          </Link>
                        </DropdownMenuItem>
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
