import type { InvoiceStatus } from '@prisma/client';
import type { CompanyDetails } from '../dashboard/dashboard-types';

export interface InvoiceListItem {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string | null;
    name: string;
  };
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus | string;
  total: number;
  paidAmount: number;
}

export interface InvoicesClientProps {
  initialInvoices: InvoiceListItem[];
  initialCompany: CompanyDetails | null;
  initialSubscription: string;
  initialInvoicesThisMonth: number;
}
