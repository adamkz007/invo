"use client"

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { PeriodSelector, usePeriodDates, getPeriodLabel, type PeriodOption } from '@/components/accounting/period-selector';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type CFItem = { accountId: string; code: string; name: string; delta: number };

export default function CashFlowPage() {
  const { settings } = useSettings();
  const [items, setItems] = useState<CFItem[]>([]);
  const [total, setTotal] = useState(0);
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
      const res = await fetch(`/api/accounting/reports/cash-flow?${params.toString()}`, { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
      }
      setLoading(false);
    })();
  }, [start, end]);

  const periodLabel = getPeriodLabel(period, customFrom, customTo);

  function exportCSV() {
    const header = ['Code', 'Name', 'Change'];
    const rows = items.map(i => [i.code, i.name, i.delta.toFixed(2)]);
    const csv = [header, ...rows, ['Total', '', total.toFixed(2)]].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow-${periodLabel}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadCashFlowPDF } = await import('@/lib/pdf-generator');
    await downloadCashFlowPDF(items, total, periodLabel);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/accounting/reports">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-xl font-semibold">Cash Flow Statement</h1>
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
            <CardTitle className="text-sm">Cash & Bank Movements</CardTitle>
            <span className={`text-sm font-mono font-medium ${total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Net: {formatCurrency(total, settings)}
            </span>
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
                <span className={`font-mono shrink-0 ${i.delta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {i.delta >= 0 ? '+' : ''}{formatCurrency(i.delta, settings)}
                </span>
              </div>
            ))}
            {items.length === 0 && !loading && (
              <div className="p-3 text-sm text-muted-foreground">No cash movements found</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
