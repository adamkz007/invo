'use client';

import React, { useState, useEffect } from 'react';
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
import { 
  Download, 
  MoreHorizontal, 
  Plus, 
  Search,
  Calendar,
  User,
  Receipt,
  CreditCard,
  Phone
} from 'lucide-react';
import Link from 'next/link';
import { formatCurrency, format } from '@/lib/utils';
import { downloadReceiptPDF } from '@/lib/pdf-generator';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import { ReceiptWithDetails } from '@/types';

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
  paymentMethod?: string;
  bankAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  qrImageUrl?: string;
}

export default function ReceiptsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptWithDetails | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { showToast } = useToast();
  const router = useRouter();
  const { settings } = useSettings();

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

  const handleViewReceipt = (receipt: ReceiptWithDetails) => {
    // Fetch the complete receipt details with items
    fetch(`/api/receipts/${receipt.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch complete receipt details');
        }
        return response.json();
      })
      .then(data => {
        // Update the selected receipt with complete data
        setSelectedReceipt(data);
        setIsViewDialogOpen(true);
      })
      .catch(error => {
        console.error('Error fetching complete receipt:', error);
        showToast({
          variant: 'error',
          message: 'Could not load receipt details'
        });
      });
  };

  const handleDownloadPDF = (receipt: ReceiptWithDetails) => {
    // Ensure we fetch the complete receipt with items
    fetch(`/api/receipts/${receipt.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch complete receipt details');
        }
        return response.json();
      })
      .then(completeReceipt => {
        // Download PDF using the receipt-to-PDF function
        downloadReceiptPDF(completeReceipt, companyDetails, settings);
      })
      .catch(error => {
        console.error('Error generating receipt PDF:', error);
        showToast({
          variant: 'error',
          message: 'Could not generate receipt PDF'
        });
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Receipts</h1>
        <Button asChild>
          <Link href="/receipts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Receipt
          </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search receipts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <ReceiptsList 
            searchTerm={searchTerm}
            onViewReceipt={handleViewReceipt}
            onDownloadPDF={handleDownloadPDF}
          />
        </CardContent>
      </Card>

      {/* Receipt View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Receipt #{selectedReceipt?.receiptNumber}</DialogTitle>
            <DialogDescription>
              Issued on {selectedReceipt?.receiptDate ? format(new Date(selectedReceipt.receiptDate), 'PPP') : ''}
            </DialogDescription>
          </DialogHeader>

          {selectedReceipt && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium">Customer Information</h3>
                  <p>{selectedReceipt.customerName || 'Walk-in Customer'}</p>
                  {selectedReceipt.customerPhone && (
                    <p>Phone: {selectedReceipt.customerPhone}</p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium">Payment Information</h3>
                  <p>Method: {selectedReceipt.paymentMethod}</p>
                  <p>Date: {format(new Date(selectedReceipt.receiptDate), 'PPP')}</p>
                  <p>Total: {formatCurrency(selectedReceipt.total, settings)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-2">Items</h3>
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
                    {selectedReceipt.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product.name}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.unitPrice, settings)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice, settings)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {selectedReceipt.notes && (
                <div>
                  <h3 className="font-medium">Notes</h3>
                  <p>{selectedReceipt.notes}</p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => selectedReceipt && handleDownloadPDF(selectedReceipt)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ReceiptsList({ 
  searchTerm,
  onViewReceipt,
  onDownloadPDF
}: { 
  searchTerm: string,
  onViewReceipt: (receipt: ReceiptWithDetails) => void,
  onDownloadPDF: (receipt: ReceiptWithDetails) => void
}) {
  const [receipts, setReceipts] = useState<ReceiptWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useSettings();
  const { showToast } = useToast();

  // Fetch receipts
  useEffect(() => {
    async function fetchReceipts() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/receipts');
        
        if (!response.ok) {
          throw new Error('Failed to fetch receipts');
        }
        
        const data = await response.json();
        setReceipts(data);
      } catch (error) {
        console.error('Error fetching receipts:', error);
        showToast({
          variant: 'error',
          message: 'Failed to load receipts'
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchReceipts();
  }, [showToast]);

  // Filter receipts based on search term
  const filteredReceipts = receipts.filter(receipt => {
    if (!searchTerm) return true;
    
    const searchLower = searchTerm.toLowerCase();
    return (
      receipt.receiptNumber?.toLowerCase().includes(searchLower) ||
      receipt.customerName?.toLowerCase().includes(searchLower) ||
      receipt.customerPhone?.toLowerCase().includes(searchLower) ||
      receipt.paymentMethod?.toLowerCase().includes(searchLower)
    );
  });

  if (isLoading) {
    return <div className="flex justify-center p-4">Loading receipts...</div>;
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-8">
        <Receipt className="mx-auto h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No receipts yet</h3>
        <p className="text-muted-foreground">Create your first receipt to get started</p>
        <Button asChild className="mt-4">
          <Link href="/receipts/new">
            <Plus className="mr-2 h-4 w-4" />
            New Receipt
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Receipt #</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Payment Method</TableHead>
          <TableHead className="text-right">Total</TableHead>
          <TableHead className="w-[80px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filteredReceipts.map((receipt) => (
          <TableRow key={receipt.id}>
            <TableCell>{receipt.receiptNumber}</TableCell>
            <TableCell>
              <div className="flex flex-col">
                <span>{receipt.customerName || 'Walk-in Customer'}</span>
                {receipt.customerPhone && (
                  <span className="text-xs text-muted-foreground flex items-center">
                    <Phone className="mr-1 h-3 w-3" />
                    {receipt.customerPhone}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {format(new Date(receipt.receiptDate), 'PP')}
              </div>
            </TableCell>
            <TableCell>
              <div className="flex items-center">
                <CreditCard className="mr-2 h-4 w-4 text-muted-foreground" />
                {receipt.paymentMethod}
              </div>
            </TableCell>
            <TableCell className="text-right font-medium">
              {formatCurrency(receipt.total, settings)}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewReceipt(receipt)}>
                    View receipt
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDownloadPDF(receipt)}>
                    Download PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 