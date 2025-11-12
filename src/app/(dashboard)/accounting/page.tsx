import { Suspense } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

async function fetchMetrics() {
  try {
    const res = await fetch('/api/accounting/dashboard', { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

function MetricCard({ title, value, hint, icon: Icon }: { title: string; value: string; hint?: string; icon: any }) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-5 w-5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-2xl font-bold">{value}</div>
        {hint ? <p className="text-xs text-muted-foreground mt-1">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default async function AccountingPage() {
  const metrics = await fetchMetrics();
  const ar = metrics?.accountsReceivableTotal ?? 0;
  const cash = metrics?.cashBalance ?? 0;
  const expenses = metrics?.expensesMonth ?? 0;
  const revenue = metrics?.revenueMonth ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Accounting</h1>
        <Badge className="text-xs">Mobile-first</Badge>
      </div>

      {/* KPI Cards (mobile-first grid) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard title="Accounts Receivable" value={`$${ar.toFixed(2)}`} hint="Open invoices" icon={FileText} />
        <MetricCard title="Cash" value={`$${cash.toFixed(2)}`} hint="Bank & cash" icon={Wallet} />
        <MetricCard title="Revenue (MTD)" value={`$${revenue.toFixed(2)}`} icon={TrendingUp} />
        <MetricCard title="Expenses (MTD)" value={`$${expenses.toFixed(2)}`} icon={TrendingDown} />
      </div>

      {/* Quick actions (thumb-friendly) */}
      <div className="grid grid-cols-2 gap-2">
        <Link href="/accounting/journals/new">
          <Button className="w-full">New Journal</Button>
        </Link>
        <Link href="/accounting/expenses/new">
          <Button variant="secondary" className="w-full">Record Expense</Button>
        </Link>
      </div>

      {/* Shortcuts */}
      <div className="grid grid-cols-1 gap-2">
        <Link href="/accounting/ledger" className="text-sm text-primary">View Ledger</Link>
        <Link href="/accounting/reports" className="text-sm text-primary">Reports</Link>
        <Link href="/accounting/accounts" className="text-sm text-primary">Chart of Accounts</Link>
      </div>
    </div>
  );
}

