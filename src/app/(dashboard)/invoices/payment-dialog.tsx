'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogHeader
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DollarSign } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useSettings } from '@/contexts/settings-context';
import type { InvoiceListItem } from './invoices-types';

const getTodayDateString = () => new Date().toISOString().slice(0, 10);

// Helper function to extract paid amount
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

export interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceListItem | null;
  paymentAmount: string;
  onPaymentAmountChange: (value: string) => void;
  paymentDate: string;
  onPaymentDateChange: (value: string) => void;
  paymentMethod: 'BANK' | 'CASH';
  onPaymentMethodChange: (value: 'BANK' | 'CASH') => void;
  onSubmit: () => void;
}

export function PaymentDialog({
  open,
  onOpenChange,
  invoice,
  paymentAmount,
  onPaymentAmountChange,
  paymentDate,
  onPaymentDateChange,
  paymentMethod,
  onPaymentMethodChange,
  onSubmit,
}: PaymentDialogProps) {
  const { settings } = useSettings();

  const paidAmountForInvoice = invoice ? extractPaidAmount(invoice) : 0;
  const remainingBalance = invoice
    ? Math.max(invoice.total - paidAmountForInvoice, 0)
    : 0;
  const isPaymentAllowed = remainingBalance > 0;
  const parsedPaymentAmount = parseFloat(paymentAmount);
  const isPaymentAmountValid =
    isPaymentAllowed &&
    !Number.isNaN(parsedPaymentAmount) &&
    parsedPaymentAmount > 0 &&
    parsedPaymentAmount <= remainingBalance + 0.00001;
  const isPaymentFormValid = isPaymentAmountValid && Boolean(paymentDate);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isPaymentAllowed) {
      onPaymentAmountChange('');
      return;
    }

    const { value } = e.target;

    if (value === '') {
      onPaymentAmountChange('');
      return;
    }

    const numericValue = parseFloat(value);

    if (Number.isNaN(numericValue)) {
      onPaymentAmountChange(value);
      return;
    }

    if (numericValue < 0) {
      onPaymentAmountChange('');
      return;
    }

    if (numericValue > remainingBalance) {
      onPaymentAmountChange(remainingBalance.toFixed(2));
      return;
    }

    onPaymentAmountChange(value);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Apply Payment</DialogTitle>
          <DialogDescription>
            Enter the payment amount for invoice {invoice?.invoiceNumber}
          </DialogDescription>
        </DialogHeader>
        {invoice && (
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Invoice Total:</span>
                <span className="font-medium">{formatCurrency(invoice.total, settings)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Outstanding Balance:</span>
                <span className="font-medium">
                  {formatCurrency(remainingBalance, settings)}
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
                  onChange={(e) => onPaymentDateChange(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium">Payment Method</label>
                <Select value={paymentMethod} onValueChange={(value) => onPaymentMethodChange(value as 'BANK' | 'CASH')}>
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
                    max={isPaymentAllowed ? remainingBalance : undefined}
                    value={paymentAmount}
                    onChange={handleAmountChange}
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit} disabled={!isPaymentFormValid}>
            Apply Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
