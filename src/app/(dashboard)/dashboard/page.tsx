import { redirect } from 'next/navigation';
import { DashboardClient } from './dashboard-client';
import { getAuthenticatedUser } from '@/lib/server-auth';
import { getDashboardOverview } from '@/lib/data/dashboard';
import { getCompanyDetails as getCompanyDetailsRecord } from '@/lib/data/company';
import { mapCompanyRecordToDetails, mapDashboardOverviewToStats } from './dashboard-types';

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();

  if (!user) {
    redirect('/login');
  }

  const [overview, companyRecord] = await Promise.all([
    getDashboardOverview(user.id),
    getCompanyDetailsRecord(user.id),
  ]);

  const stats = mapDashboardOverviewToStats(overview);
  const companyDetails = mapCompanyRecordToDetails(companyRecord);

  return <DashboardClient initialStats={stats} initialCompany={companyDetails} />;
}
