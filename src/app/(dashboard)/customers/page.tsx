import { redirect } from 'next/navigation';
import { CustomersClient } from './customers-client';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getCustomersForUser } from '@/lib/data/customers';
import { getUserSubscriptionStatus } from '@/lib/data/users';

export default async function CustomersPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const [initialPage, subscriptionStatus] = await Promise.all([
    getCustomersForUser(user.id),
    getUserSubscriptionStatus(user.id),
  ]);

  return (
    <CustomersClient
      initialPage={initialPage}
      initialSubscription={subscriptionStatus}
    />
  );
}
