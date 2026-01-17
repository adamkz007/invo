'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/utils';
import type { AppSettings } from '@/lib/utils';
import type { InvoiceWithDetails } from '@/types';
import type { CompanyDetails } from '../dashboard/dashboard-types';
import { Calendar, Download, MessageCircle, Loader2 } from 'lucide-react';
import { formatPhoneNumber, isValidWhatsAppNumber } from '@/lib/whatsapp';
import { format } from 'date-fns';
import Image from 'next/image';

type Props = {
  invoice: InvoiceWithDetails | null;
  companyDetails: CompanyDetails | null;
  settings: AppSettings;
  isDarkMode: boolean;
  onClose: () => void;
  onDownloadPDF: (invoice: InvoiceWithDetails) => void;
};

export function InvoiceDetailsDialog({
  invoice,
  companyDetails,
  settings,
  isDarkMode,
  onClose,
  onDownloadPDF,
}: Props) {
  const [isShareLoading, setIsShareLoading] = useState(false);

  const handleWhatsAppShare = async (inv: InvoiceWithDetails) => {
    const phone = formatPhoneNumber(inv.customer.phoneNumber!);
    const message = `Hello! Here's your invoice totalling RM${inv.total.toFixed(2)} from Invo`;
    
    // Check if Web Share API with files is supported (mainly mobile devices)
    const canShareFiles = typeof navigator !== 'undefined' && 
      navigator.share && 
      navigator.canShare;
    
    if (canShareFiles) {
      try {
        setIsShareLoading(true);
        
        // Dynamic import to reduce bundle size
        const { generateInvoicePDFBlob } = await import('@/lib/pdf-generator');
        const { blob, filename } = await generateInvoicePDFBlob(inv, companyDetails, settings);
        
        const file = new File([blob], filename, { type: 'application/pdf' });
        
        // Check if this specific file type can be shared
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            text: message,
            files: [file],
          });
          setIsShareLoading(false);
          return;
        }
      } catch (error) {
        // User cancelled or share failed, fall back to text-only
        console.log('Web Share failed, falling back to WhatsApp URL:', error);
      } finally {
        setIsShareLoading(false);
      }
    }
    
    // Fallback: Open WhatsApp with text-only message
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Dialog open={invoice !== null} onOpenChange={onClose}>
      <DialogContent className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[90vh] sm:max-h-[85vh] dark:bg-gradient-to-br dark:from-card dark:to-card/95">
        <DialogTitle className="sr-only">Invoice Details</DialogTitle>
        {invoice && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground/80">Bill To:</h3>
                <p className="font-medium dark:text-foreground/90">{invoice.customer.name}</p>
                {invoice.customer.email && (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">{invoice.customer.email}</p>
                )}
                {invoice.customer.phoneNumber && (
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">{invoice.customer.phoneNumber}</p>
                )}
                {(invoice.customer.street ||
                  invoice.customer.city ||
                  invoice.customer.postcode ||
                  invoice.customer.state ||
                  invoice.customer.country) && (
                  <div className="text-sm text-muted-foreground dark:text-muted-foreground/80 whitespace-pre-line">
                    {invoice.customer.street && <p>{invoice.customer.street}</p>}
                    {invoice.customer.city && invoice.customer.postcode && (
                      <p>
                        {invoice.customer.city}, {invoice.customer.postcode}
                      </p>
                    )}
                    {invoice.customer.city && !invoice.customer.postcode && <p>{invoice.customer.city}</p>}
                    {!invoice.customer.city && invoice.customer.postcode && <p>{invoice.customer.postcode}</p>}
                    {invoice.customer.state && <p>{invoice.customer.state}</p>}
                    {invoice.customer.country && <p>{invoice.customer.country}</p>}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold dark:text-foreground">Invoice #{invoice.invoiceNumber}</h2>
                  {invoice.status && (
                    <div className="rounded-full bg-muted px-3 py-1 text-xs font-semibold dark:bg-muted/60">
                      {invoice.status}
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1 text-sm dark:text-foreground/90">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/80" />
                    <span>Issued: {format(new Date(invoice.issueDate), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Due: {format(new Date(invoice.dueDate), 'MMMM d, yyyy')}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted/50 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-sm font-semibold">From:</h3>
                <span className="font-medium">{companyDetails?.legalName || 'Your Company'}</span>
              </div>
              {companyDetails?.email && <p className="text-xs text-muted-foreground">{companyDetails.email}</p>}
              {companyDetails?.phoneNumber && <p className="text-xs text-muted-foreground">{companyDetails.phoneNumber}</p>}
              {companyDetails?.address && <p className="text-xs text-muted-foreground">{companyDetails.address}</p>}
            </div>

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
                    {invoice.items?.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.product.name}
                          {item.description && <p className="text-xs text-muted-foreground mt-1">{item.description}</p>}
                        </TableCell>
                        <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                        <TableCell className="text-right font-bold">{formatCurrency(item.unitPrice, settings)}</TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(item.quantity * item.unitPrice, settings)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span>Subtotal:</span>
                <span>{formatCurrency(invoice.subtotal || 0, settings)}</span>
              </div>

              {invoice.taxRate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span>Tax ({invoice.taxRate}%):</span>
                  <span>{formatCurrency(invoice.taxAmount || 0, settings)}</span>
                </div>
              )}

              {invoice.discountRate > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span>Discount ({invoice.discountRate}%):</span>
                  <span>-{formatCurrency(invoice.discountAmount || 0, settings)}</span>
                </div>
              )}

              <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>{formatCurrency(invoice.total || 0, settings)}</span>
              </div>

              {invoice.paidAmount && invoice.paidAmount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm text-green-600">
                    <span>Paid:</span>
                    <span>{formatCurrency(invoice.paidAmount, settings)}</span>
                  </div>

                  <div className="flex justify-between items-center font-bold">
                    <span>Balance Due:</span>
                    <span>{formatCurrency(invoice.total - invoice.paidAmount, settings)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="text-center text-sm text-muted-foreground mt-4">
              <p>Thank you for your business!</p>
              <div className="flex items-center justify-center mt-2">
                <span>Powered by</span>
                <div className="flex items-center ml-1">
                  <Image
                    src={isDarkMode ? '/invo-logo-w.png' : '/invo-logo.png'}
                    alt="Invo Logo"
                    className="h-4 w-4 mr-1"
                    width={16}
                    height={16}
                  />
                  <span className="text-xs font-medium">Invo</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center gap-3 mt-6">
              <Button onClick={() => onDownloadPDF(invoice)} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Download PDF
              </Button>
              {invoice.customer.phoneNumber && isValidWhatsAppNumber(invoice.customer.phoneNumber) && (
                <Button
                  onClick={() => handleWhatsAppShare(invoice)}
                  disabled={isShareLoading}
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20BA5A] text-white disabled:opacity-70"
                >
                  {isShareLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4" />
                  )}
                  WhatsApp
                </Button>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

