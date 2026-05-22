"use client"

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { PeriodSelector, usePeriodDates, type PeriodOption } from '@/components/accounting/period-selector';

type Metrics = { accountsReceivableTotal: number; revenueMonth: number; cashBalance: number; expensesMonth: number } | null;
type Expense = { id: string; vendor: string; date: string; total: string; status: string };

function MetricCard({ title, value, hint, icon: Icon }: { title: string; value: string; hint?: string; icon: any }) {
  return (
    <Card className="rounded-xl">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-2.5 pb-1.5">
        <CardTitle className="text-xs font-medium">{title}</CardTitle>
        <Icon className="h-3.5 w-3.5 text-muted-foreground" />
      </CardHeader>
      <CardContent className="p-2.5 pt-0">
        <div className="text-lg font-bold leading-tight">{value}</div>
        {hint ? <p className="mt-0.5 text-[11px] leading-none text-muted-foreground">{hint}</p> : null}
      </CardContent>
    </Card>
  );
}

export default function AccountingPage() {
  const { settings } = useSettings();
  const [metrics, setMetrics] = useState<Metrics>(null);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [period, setPeriod] = useState<PeriodOption>('MTD');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [loading, setLoading] = useState(false);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const { start, end } = usePeriodDates(period, customFrom, customTo);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.set('start', start.toISOString());
      if (end) params.set('end', end.toISOString());
      try {
        const res = await fetch(`/api/accounting/dashboard?${params.toString()}`, { cache: 'no-store' });
        if (res.ok) setMetrics(await res.json());
      } finally {
        setLoading(false);
      }
    })();
  }, [start, end]);

  useEffect(() => {
    (async () => {
      setExpensesLoading(true);
      const res = await fetch('/api/accounting/expenses', { cache: 'no-store' });
      if (res.ok) {
        const items: Expense[] = await res.json();
        setRecentExpenses(items.slice(0, 5));
      }
      setExpensesLoading(false);
    })();
  }, []);

  const ar = metrics?.accountsReceivableTotal ?? 0;
  const cash = metrics?.cashBalance ?? 0;
  const expenses = metrics?.expensesMonth ?? 0;
  const revenue = metrics?.revenueMonth ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Overview</h1>
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <MetricCard title="Accounts Receivable" value={formatCurrency(ar, settings)} hint="Unpaid invoices" icon={FileText} />
        <MetricCard title="Cash" value={formatCurrency(cash, settings)} hint="Bank & cash" icon={Wallet} />
        <MetricCard title="Revenue" value={formatCurrency(revenue, settings)} icon={TrendingUp} />
        <MetricCard title="Expenses" value={formatCurrency(expenses, settings)} icon={TrendingDown} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Link href="/accounting/expenses/new">
          <Button variant="secondary" className="w-full">Record Expense</Button>
        </Link>
        <Link href="/accounting/reports">
          <Button variant="outline" className="w-full">View Reports</Button>
        </Link>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Recent Expenses</CardTitle>
            <Link href="/accounting/expenses" className="text-xs text-primary">View all</Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {recentExpenses.map((expense) => (
              <div key={expense.id} className="flex items-center justify-between p-3 text-sm">
                <div className="min-w-0 flex-1">
                  <div className="font-medium truncate">{expense.vendor}</div>
                  <div className="text-xs text-muted-foreground">{new Date(expense.date).toLocaleDateString()}</div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="font-mono">{formatCurrency(Number(expense.total), settings)}</div>
                  <div className="text-[10px] text-muted-foreground">{expense.status}</div>
                </div>
              </div>
            ))}
            {!expensesLoading && recentExpenses.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No expenses yet</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
