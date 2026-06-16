import type { InvoiceWithDetails } from '@/types';
import type { InvoiceDetailResponseDto } from '@/lib/dto/invoices';

export function toPdfInvoice(invoice: InvoiceDetailResponseDto): InvoiceWithDetails {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    customer: {
      id: invoice.customer?.id ?? '',
      name: invoice.customer?.name ?? 'Unknown customer',
      email: invoice.customer?.email ?? null,
      phoneNumber: invoice.customer?.phoneNumber ?? null,
      street: invoice.customer?.street ?? null,
      city: invoice.customer?.city ?? null,
      postcode: invoice.customer?.postcode ?? null,
      state: invoice.customer?.state ?? null,
      country: invoice.customer?.country ?? null,
    },
    issueDate: new Date(invoice.issueDate),
    dueDate: new Date(invoice.dueDate),
    status: invoice.status,
    subtotal: invoice.subtotal,
    taxRate: invoice.taxRate,
    taxAmount: invoice.taxAmount,
    discountRate: invoice.discountRate,
    discountAmount: invoice.discountAmount,
    total: invoice.total,
    paidAmount: invoice.paidAmount,
    notes: invoice.notes ?? undefined,
    items: invoice.items.map((item) => ({
      id: item.id,
      product: {
        name: item.product?.name ?? item.description ?? 'Item',
        description: item.description ?? undefined,
      },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      description: item.description ?? undefined,
    })),
    payments: invoice.payments.map((payment) => ({
      id: payment.id,
      amount: payment.amount,
      paymentDate: payment.paymentDate,
      paymentMethod: payment.paymentMethod,
      notes: payment.notes,
    })),
  };
}
