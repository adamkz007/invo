"use client"
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { FileText, Wallet, TrendingUp, TrendingDown } from 'lucide-react';

type Metrics = { accountsReceivableTotal: number; revenueMonth: number; cashBalance: number; expensesMonth: number } | null;

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

export default function AccountingPage() {
  const [metrics, setMetrics] = useState<Metrics>(null);
  const [period, setPeriod] = useState<string>('MTD');
  const [loading, setLoading] = useState(false);

  const { start, end } = useMemo(() => {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    if (period === 'MTD') {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end };
    }
    if (period === 'QTD') {
      const quarter = Math.floor(now.getMonth() / 3);
      const startMonth = quarter * 3;
      const start = new Date(now.getFullYear(), startMonth, 1);
      return { start, end };
    }
    if (period === 'YTD') {
      const start = new Date(now.getFullYear(), 0, 1);
      return { start, end };
    }
    if (period === 'Last 30 Days') {
      const start = new Date(now);
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      return { start, end };
    }
    return { start: undefined, end: undefined } as { start?: Date; end?: Date };
  }, [period]);

  async function loadMetrics() {
    setLoading(true);
    const params = new URLSearchParams();
    if (start) params.set('start', start.toISOString());
    if (end) params.set('end', end.toISOString());
    try {
      const res = await fetch(`/api/accounting/dashboard${params.toString() ? `?${params.toString()}` : ''}`, { cache: 'no-store' });
      if (res.ok) {
        setMetrics(await res.json());
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMetrics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period]);

  const ar = metrics?.accountsReceivableTotal ?? 0;
  const cash = metrics?.cashBalance ?? 0;
  const expenses = metrics?.expensesMonth ?? 0;
  const revenue = metrics?.revenueMonth ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Accounting</h1>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Timeframe" /></SelectTrigger>
          <SelectContent>
            {['MTD','QTD','YTD','Last 30 Days','All Time'].map((p) => (
              <SelectItem key={p} value={p}>{p}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* KPI Cards (mobile-first grid) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <MetricCard title="Accounts Receivable" value={`$${ar.toFixed(2)}`} hint="Open invoices" icon={FileText} />
        <MetricCard title="Cash" value={`$${cash.toFixed(2)}`} hint="Bank & cash" icon={Wallet} />
        <MetricCard title={`Revenue${period === 'All Time' ? '' : ` (${period})`}`} value={`$${revenue.toFixed(2)}`} icon={TrendingUp} />
        <MetricCard title={`Expenses${period === 'All Time' ? '' : ` (${period})`}`} value={`$${expenses.toFixed(2)}`} icon={TrendingDown} />
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
        <Link href="/accounting/expenses" className="text-sm text-primary">View Expenses</Link>
        <Link href="/accounting/reports/trial-balance" className="text-sm text-primary">Reports</Link>
        <Link href="/accounting/accounts" className="text-sm text-primary">Chart of Accounts</Link>
      </div>
    </div>
  );
}
