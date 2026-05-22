"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { PeriodSelector, usePeriodDates, getPeriodLabel, type PeriodOption } from '@/components/accounting/period-selector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type PLItem = { accountId: string; code: string; name: string; type: string; amount: number };

export default function ProfitLossPage() {
  const { settings } = useSettings();
  const [revenues, setRevenues] = useState<PLItem[]>([]);
  const [expenses, setExpenses] = useState<PLItem[]>([]);
  const [totals, setTotals] = useState<{ revenue: number; expense: number; netIncome: number }>({ revenue: 0, expense: 0, netIncome: 0 });
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodOption>('YTD');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { start, end } = usePeriodDates(period, customFrom, customTo);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (start) params.set('start', start.toISOString());
      if (end) params.set('end', end.toISOString());
      const res = await fetch(`/api/accounting/reports/profit-loss?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setRevenues(data.revenues);
        setExpenses(data.expenses);
        setTotals(data.totals);
      }
      setLoading(false);
    })();
  }, [start, end]);

  const periodLabel = getPeriodLabel(period, customFrom, customTo);

  function exportCSV() {
    const header = ['Section', 'Code', 'Name', 'Amount'];
    const rows = [
      ...revenues.map(i => ['Revenue', i.code, i.name, i.amount.toFixed(2)]),
      ...expenses.map(i => ['Expense', i.code, i.name, i.amount.toFixed(2)]),
      ['', '', 'Net Income', totals.netIncome.toFixed(2)],
    ];
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss-${periodLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadProfitLossPDF } = await import('@/lib/pdf-generator');
    await downloadProfitLossPDF(revenues, expenses, totals, periodLabel);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/accounting/reports">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Profit & Loss</h1>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <PeriodSelector
          period={period}
          onPeriodChange={setPeriod}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
        />
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV} disabled={loading}>CSV</Button>
          <Button size="sm" onClick={exportPDF} disabled={loading}>PDF</Button>
        </div>
      </div>

      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="p-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Revenue</CardTitle>
            <span className="text-sm font-mono font-medium text-green-600">{formatCurrency(totals.revenue, settings)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {revenues.map((i) => (
              <div key={i.accountId} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <span className="font-medium">{i.code}</span>
                  <span className="text-muted-foreground ml-2">{i.name}</span>
                </div>
                <span className="font-mono shrink-0">{formatCurrency(i.amount, settings)}</span>
              </div>
            ))}
            {revenues.length === 0 && <div className="p-3 text-sm text-muted-foreground">No revenue</div>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="p-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Expenses</CardTitle>
            <span className="text-sm font-mono font-medium text-red-600">{formatCurrency(totals.expense, settings)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {expenses.map((i) => (
              <div key={i.accountId} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <span className="font-medium">{i.code}</span>
                  <span className="text-muted-foreground ml-2">{i.name}</span>
                </div>
                <span className="font-mono shrink-0">{formatCurrency(i.amount, settings)}</span>
              </div>
            ))}
            {expenses.length === 0 && <div className="p-3 text-sm text-muted-foreground">No expenses</div>}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardContent className="p-4">
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Net Income</span>
            <span className={`font-mono ${totals.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totals.netIncome, settings)}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
