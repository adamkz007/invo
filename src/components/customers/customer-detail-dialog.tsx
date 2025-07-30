'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { FileText, Mail, Phone, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';

interface CustomerDetailDialogProps {
  customerId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface CustomerDetails {
  id: string;
  name: string;
  email: string | null;
  phoneNumber: string | null;
  totalPurchases: number;
  paidPurchases: number;
  invoiceCount: number;
}

export function CustomerDetailDialog({ 
  customerId, 
  isOpen, 
  onClose 
}: CustomerDetailDialogProps) {
  const [customer, setCustomer] = useState<CustomerDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { settings } = useSettings();

  useEffect(() => {
    if (isOpen && customerId) {
      fetchCustomerDetails();
    }
  }, [isOpen, customerId]);

  const fetchCustomerDetails = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch(`/api/customers/${customerId}/details`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch customer details');
      }
      
      const data = await response.json();
      setCustomer(data);
    } catch (err) {
      console.error('Error fetching customer details:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateInvoice = () => {
    router.push(`/invoices/new?customerId=${customerId}`);
    onClose();
  };

  const handleSendEmail = () => {
    if (customer?.email) {
      window.location.href = `mailto:${customer.email}`;
    }
  };

  const handleCall = () => {
    if (customer?.phoneNumber) {
      window.location.href = `tel:${customer.phoneNumber}`;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md animate-in fade-in-50 zoom-in-95 duration-200 dark:bg-gradient-to-br dark:from-card dark:to-card/95">
        <DialogHeader>
          <DialogTitle>Customer Details</DialogTitle>
          <DialogDescription>
            View customer information and quick actions
          </DialogDescription>
        </DialogHeader>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary shadow-sm"></div>
            <p className="ml-3 text-muted-foreground animate-pulse">Loading...</p>
          </div>
        ) : error ? (
          <div className="py-6 text-center">
            <p className="text-red-500 mb-4 font-medium">Error: {error}</p>
            <Button 
              variant="outline" 
              onClick={fetchCustomerDetails}
              className="hover:bg-red-50 hover:text-red-600 border-red-200 text-red-500 transition-colors duration-200"
            >
              Try Again
            </Button>
          </div>
        ) : customer ? (
          <div className="py-4">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-1">{customer.name}</h3>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-muted/50 p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-muted/80 transition-all duration-200">
                  <p className="text-sm text-muted-foreground">Total Purchases</p>
                  <p className="text-xl font-semibold">{formatCurrency(customer.totalPurchases, settings)}</p>
                </div>
                
                <div className="bg-muted/50 p-4 rounded-lg shadow-sm hover:shadow-md hover:bg-muted/80 transition-all duration-200">
                  <p className="text-sm text-muted-foreground">Invoice Count</p>
                  <p className="text-xl font-semibold">{customer.invoiceCount}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <Button 
                className="w-full justify-start hover:shadow-md transition-all duration-200 group" 
                onClick={handleCreateInvoice}
              >
                <FileText className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                Create New Invoice
              </Button>
              
              <Button 
                className="w-full justify-start hover:shadow-sm hover:bg-primary/10 transition-all duration-200 group" 
                variant="outline" 
                onClick={handleSendEmail}
                disabled={!customer.email}
              >
                <Mail className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                Send Email
              </Button>
              
              <Button 
                className="w-full justify-start hover:shadow-sm hover:bg-primary/10 transition-all duration-200 group" 
                variant="outline" 
                onClick={handleCall}
                disabled={!customer.phoneNumber}
              >
                <Phone className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                Call
              </Button>
            </div>
          </div>
        ) : null}
        
        <DialogFooter className="sm:justify-start">
          <Button 
            variant="secondary" 
            onClick={onClose}
            className="hover:bg-muted/80 transition-colors duration-200 group"
          >
            <X className="mr-2 h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}