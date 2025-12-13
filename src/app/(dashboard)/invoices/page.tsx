import { redirect } from 'next/navigation';
import { InvoicesClient } from './invoices-client';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getCachedInvoiceList, getCachedInvoicesCreatedThisMonth } from '@/lib/data/invoices';
import { getCompanyDetails } from '@/lib/data/company';
import { mapCompanyRecordToDetails } from '../dashboard/dashboard-types';
import type { InvoiceListItem } from './invoices-types';
import { getUserSubscriptionStatus } from '@/lib/data/users';

export default async function InvoicesPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const [invoiceList, companyRecord, subscriptionStatus, invoicesThisMonth] = await Promise.all([
    getCachedInvoiceList(user.id),
    getCompanyDetails(user.id),
    getUserSubscriptionStatus(user.id),
    getCachedInvoicesCreatedThisMonth(user.id),
  ]);

  const initialInvoices: InvoiceListItem[] = invoiceList.data;
  const companyDetails = mapCompanyRecordToDetails(companyRecord);

  return (
    <InvoicesClient
      initialInvoices={initialInvoices}
      initialCompany={companyDetails}
      initialSubscription={subscriptionStatus}
      initialInvoicesThisMonth={invoicesThisMonth}
    />
  );
}
