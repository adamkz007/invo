"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { PeriodSelector, usePeriodDates, getPeriodLabel, type PeriodOption } from '@/components/accounting/period-selector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type TBItem = { accountId: string; code: string; name: string; type: string; debit: number; credit: number; balance: number };

export default function TrialBalancePage() {
  const { settings } = useSettings();
  const [items, setItems] = useState<TBItem[]>([]);
  const [totals, setTotals] = useState<{ debit: number; credit: number }>({ debit: 0, credit: 0 });
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
      const res = await fetch(`/api/accounting/reports/trial-balance?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotals(data.totals);
      }
      setLoading(false);
    })();
  }, [start, end]);

  const periodLabel = getPeriodLabel(period, customFrom, customTo);

  function exportCSV() {
    const header = ['Code', 'Name', 'Type', 'Debit', 'Credit', 'Balance'];
    const rows = items.map(i => [i.code, i.name, i.type, i.debit.toFixed(2), i.credit.toFixed(2), i.balance.toFixed(2)]);
    const csv = [header, ...rows, ['', '', 'Totals', totals.debit.toFixed(2), totals.credit.toFixed(2), (totals.debit - totals.credit).toFixed(2)]].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance-${periodLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadTrialBalancePDF } = await import('@/lib/pdf-generator');
    await downloadTrialBalancePDF(items, periodLabel);
  }

  const balanced = Math.abs(totals.debit - totals.credit) < 0.01;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/accounting/reports">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Trial Balance</h1>
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

      {!loading && items.length > 0 && (
        <div className={`text-xs font-medium ${balanced ? 'text-green-600' : 'text-red-600'}`}>
          {balanced ? 'Balanced' : `Imbalance: ${formatCurrency(totals.debit - totals.credit, settings)}`}
        </div>
      )}

      <Card className="rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left p-3 font-medium">Account</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Type</th>
                <th className="text-right p-3 font-medium">Debit</th>
                <th className="text-right p-3 font-medium">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.map((i) => (
                <tr key={i.accountId} className="hover:bg-muted/20">
                  <td className="p-3">
                    <div className="font-medium">{i.code}</div>
                    <div className="text-xs text-muted-foreground">{i.name}</div>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{i.type}</td>
                  <td className="p-3 text-right font-mono">{i.debit > 0 ? formatCurrency(i.debit, settings) : '-'}</td>
                  <td className="p-3 text-right font-mono">{i.credit > 0 ? formatCurrency(i.credit, settings) : '-'}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-muted/30 font-medium">
                <td className="p-3">Totals ({items.length} accounts)</td>
                <td className="p-3 hidden sm:table-cell" />
                <td className="p-3 text-right font-mono">{formatCurrency(totals.debit, settings)}</td>
                <td className="p-3 text-right font-mono">{formatCurrency(totals.credit, settings)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </Card>
    </div>
  );
}
