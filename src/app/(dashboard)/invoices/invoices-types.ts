import type { CompanyDetails } from '../dashboard/dashboard-types';
import type { InvoiceListItemDto } from '@/lib/dto/invoices';

export type InvoiceListItem = InvoiceListItemDto;

export interface InvoicesClientProps {
  initialInvoices: InvoiceListItem[];
  initialCompany: CompanyDetails | null;
  initialSubscription: string;
  initialInvoicesThisMonth: number;
}
