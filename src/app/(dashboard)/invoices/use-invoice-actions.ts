'use client';

import { useState } from 'react';
import { extractPaidAmount, getTodayDateString } from '@/lib/utils';
import type { ToastProps } from '@/components/ui/toast';
import type { InvoiceListItem } from './invoices-types';
import type { InvoiceDetailResponseDto, InvoiceMutationAction } from '@/lib/dto/invoices';
import { emitInvoiceMetric } from './invoice-performance';

type PaymentMethod = 'BANK' | 'CASH';

interface UseInvoiceActionsParams {
  showToast: (props: ToastProps) => void;
  invalidateInvoiceDetails: (invoiceId: string) => void;
  onInvoicePatched: (invoiceId: string, patch: Partial<InvoiceListItem>) => void;
}

type InvoiceActionResponse = {
  id: InvoiceDetailResponseDto['id'];
  status?: InvoiceDetailResponseDto['status'];
  paidAmount?: InvoiceDetailResponseDto['paidAmount'];
};

async function runInvoiceAction(
  invoiceId: string,
  body: Record<string, unknown>,
  fallbackErrorMessage: string,
): Promise<InvoiceActionResponse | null> {
  const response = await fetch(`/api/invoices/${invoiceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (response.ok) {
    return (await response.json().catch(() => null)) as InvoiceActionResponse | null;
  }

  const errorData = await response.json().catch(() => null);
  const apiError = (errorData as { error?: string } | null)?.error;
  throw new Error(apiError || fallbackErrorMessage);
}

export function useInvoiceActions({
  showToast,
  invalidateInvoiceDetails,
  onInvoicePatched,
}: UseInvoiceActionsParams) {
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState<InvoiceListItem | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(getTodayDateString);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('BANK');

  const handleCancelInvoice = async (invoice: InvoiceListItem) => {
    const start = performance.now();
    const previousStatus = invoice.status;
    onInvoicePatched(invoice.id, { status: 'CANCELLED' });

    try {
      await runInvoiceAction(
        invoice.id,
        { action: 'cancel' as InvoiceMutationAction },
        'Failed to cancel invoice',
      );
      emitInvoiceMetric({
        name: 'invoice_mutation_roundtrip_ms',
        value: Number((performance.now() - start).toFixed(1)),
        id: invoice.id,
        startTime: Date.now(),
        label: 'cancel',
      });
      invalidateInvoiceDetails(invoice.id);
      showToast({
        variant: 'success',
        message: 'Invoice cancelled successfully',
      });
    } catch (error) {
      console.error('Error cancelling invoice:', error);
      onInvoicePatched(invoice.id, { status: previousStatus });
      showToast({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Failed to cancel invoice',
      });
    }
  };

  const handleMarkAsSent = async (invoice: InvoiceListItem) => {
    const start = performance.now();
    const previousStatus = invoice.status;
    onInvoicePatched(invoice.id, { status: 'SENT' });

    try {
      await runInvoiceAction(
        invoice.id,
        { action: 'mark_sent' as InvoiceMutationAction },
        'Failed to mark invoice as sent',
      );
      emitInvoiceMetric({
        name: 'invoice_mutation_roundtrip_ms',
        value: Number((performance.now() - start).toFixed(1)),
        id: invoice.id,
        startTime: Date.now(),
        label: 'mark_sent',
      });
      invalidateInvoiceDetails(invoice.id);
      showToast({
        variant: 'success',
        message: 'Invoice marked as sent',
      });
    } catch (error) {
      console.error('Error marking invoice as sent:', error);
      onInvoicePatched(invoice.id, { status: previousStatus });
      showToast({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Failed to mark invoice as sent',
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
    const start = performance.now();

    const invoicePaidAmount = extractPaidAmount(selectedInvoiceForPayment);
    const outstandingAmount = Math.max(selectedInvoiceForPayment.total - invoicePaidAmount, 0);
    const parsedAmount = parseFloat(paymentAmount);

    if (outstandingAmount <= 0) {
      showToast({
        variant: 'error',
        message: 'This invoice has no outstanding balance.',
      });
      return;
    }

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      showToast({
        variant: 'error',
        message: 'Enter a valid payment amount greater than zero.',
      });
      return;
    }

    if (parsedAmount > outstandingAmount) {
      showToast({
        variant: 'error',
        message: 'Payment amount cannot exceed the outstanding balance.',
      });
      return;
    }

    try {
      const payload = await runInvoiceAction(
        selectedInvoiceForPayment.id,
        {
          action: 'payment' as InvoiceMutationAction,
          paymentAmount: Number(parsedAmount.toFixed(2)),
          paymentDate,
          paymentMethod,
        },
        'Failed to apply payment',
      );
      emitInvoiceMetric({
        name: 'invoice_mutation_roundtrip_ms',
        value: Number((performance.now() - start).toFixed(1)),
        id: selectedInvoiceForPayment.id,
        startTime: Date.now(),
        label: 'payment',
      });

      const updatedPaidAmount =
        typeof payload?.paidAmount === 'number'
          ? payload.paidAmount
          : Number((invoicePaidAmount + parsedAmount).toFixed(2));
      const computedStatus =
        payload?.status ??
        (updatedPaidAmount >= selectedInvoiceForPayment.total ? 'PAID' : 'PARTIAL');

      onInvoicePatched(selectedInvoiceForPayment.id, {
        paidAmount: updatedPaidAmount,
        status: computedStatus,
      });

      setPaymentDialogOpen(false);
      setSelectedInvoiceForPayment(null);
      setPaymentAmount('');
      setPaymentDate(getTodayDateString());
      setPaymentMethod('BANK');

      invalidateInvoiceDetails(selectedInvoiceForPayment.id);

      showToast({
        variant: 'success',
        message: 'Payment applied successfully',
      });
    } catch (error) {
      console.error('Error applying payment:', error);
      showToast({
        variant: 'error',
        message: error instanceof Error ? error.message : 'Failed to apply payment',
      });
    }
  };

  return {
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
  };
}
