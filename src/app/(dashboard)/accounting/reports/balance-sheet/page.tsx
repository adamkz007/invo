"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { PeriodSelector, usePeriodDates, getPeriodLabel, type PeriodOption } from '@/components/accounting/period-selector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type BSItem = { accountId: string; code: string; name: string; type: string; balance: number };

export default function BalanceSheetPage() {
  const { settings } = useSettings();
  const [assets, setAssets] = useState<BSItem[]>([]);
  const [liabilities, setLiabilities] = useState<BSItem[]>([]);
  const [equity, setEquity] = useState<BSItem[]>([]);
  const [totals, setTotals] = useState<{ assets: number; liabilities: number; equity: number }>({ assets: 0, liabilities: 0, equity: 0 });
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<PeriodOption>('YTD');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const { end } = usePeriodDates(period, customFrom, customTo);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (end) params.set('date', end.toISOString());
      const res = await fetch(`/api/accounting/reports/balance-sheet?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets);
        setLiabilities(data.liabilities);
        setEquity(data.equity);
        setTotals(data.totals);
      }
      setLoading(false);
    })();
  }, [end]);

  const periodLabel = period === 'All Time' ? 'As of Today' : `As of ${getPeriodLabel(period, customFrom, customTo)}`;
  const balanced = Math.abs(totals.assets - (totals.liabilities + totals.equity)) < 0.01;

  function exportCSV() {
    const header = ['Section', 'Code', 'Name', 'Balance'];
    const rows = [
      ...assets.map(i => ['Assets', i.code, i.name, i.balance.toFixed(2)]),
      ...liabilities.map(i => ['Liabilities', i.code, i.name, i.balance.toFixed(2)]),
      ...equity.map(i => ['Equity', i.code, i.name, i.balance.toFixed(2)]),
    ];
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet-${periodLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadBalanceSheetPDF } = await import('@/lib/pdf-generator');
    await downloadBalanceSheetPDF(assets, liabilities, equity, periodLabel);
  }

  function Section({ title, items, total }: { title: string; items: BSItem[]; total: number }) {
    return (
      <Card className="rounded-xl overflow-hidden">
        <CardHeader className="p-3 bg-muted/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{title}</CardTitle>
            <span className="text-sm font-mono font-medium">{formatCurrency(total, settings)}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((i) => (
              <div key={i.accountId} className="flex items-center justify-between p-3 text-sm">
                <div>
                  <span className="font-medium">{i.code}</span>
                  <span className="text-muted-foreground ml-2">{i.name}</span>
                </div>
                <span className="font-mono shrink-0">{formatCurrency(i.balance, settings)}</span>
              </div>
            ))}
            {items.length === 0 && (
              <div className="p-3 text-sm text-muted-foreground">No accounts</div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/accounting/reports">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Balance Sheet</h1>
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

      {!loading && (assets.length > 0 || liabilities.length > 0 || equity.length > 0) && (
        <div className={`text-xs font-medium ${balanced ? 'text-green-600' : 'text-red-600'}`}>
          {balanced ? 'A = L + E (Balanced)' : `Imbalance: Assets ${formatCurrency(totals.assets, settings)} vs L+E ${formatCurrency(totals.liabilities + totals.equity, settings)}`}
        </div>
      )}

      <Section title="Assets" items={assets} total={totals.assets} />
      <Section title="Liabilities" items={liabilities} total={totals.liabilities} />
      <Section title="Equity" items={equity} total={totals.equity} />

      <Card className="rounded-xl">
        <CardContent className="p-3">
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total Assets</span>
            <span className="font-mono">{formatCurrency(totals.assets, settings)}</span>
          </div>
          <div className="flex items-center justify-between text-sm font-medium mt-1">
            <span>Total Liabilities + Equity</span>
            <span className="font-mono">{formatCurrency(totals.liabilities + totals.equity, settings)}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
