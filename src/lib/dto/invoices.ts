import type { InvoiceStatus } from '@prisma/client';

export type InvoiceListItemDto = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  customer: {
    id: string;
    name: string;
  } | null;
};

export type InvoiceListResponseDto = {
  data: InvoiceListItemDto[];
  nextCursor?: string;
  totalCount: number;
};

export type InvoicePaymentDto = {
  id: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  notes: string | null;
};

export type InvoiceDetailLineItemDto = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  description: string | null;
  product: {
    id: string;
    name: string;
    price: number;
    disableStockManagement: boolean;
  } | null;
};

export type InvoiceDetailResponseDto = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  notes: string | null;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    street: string | null;
    city: string | null;
    postcode: string | null;
    state: string | null;
    country: string | null;
  } | null;
  items: InvoiceDetailLineItemDto[];
  payments: InvoicePaymentDto[];
  createdAt: string;
  updatedAt: string;
};

export type InvoiceMutationAction = 'cancel' | 'mark_sent' | 'payment';
