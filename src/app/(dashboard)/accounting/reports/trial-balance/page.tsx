"use client"
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type TBItem = { accountId: string; code: string; name: string; type: string; debit: number; credit: number; balance: number };

export default function TrialBalancePage() {
  const [items, setItems] = useState<TBItem[]>([]);
  const [totals, setTotals] = useState<{ debit: number; credit: number }>({ debit: 0, credit: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/accounting/reports/trial-balance', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotals(data.totals);
      }
      setLoading(false);
    })();
  }, []);

  const periodLabel = useMemo(() => 'All Time', []);

  function exportCSV() {
    const header = ['Code','Name','Type','Debit','Credit','Balance'];
    const rows = items.map(i => [i.code, i.name, i.type, i.debit.toFixed(2), i.credit.toFixed(2), i.balance.toFixed(2)]);
    const csv = [header, ...rows, ['', '', 'Totals', totals.debit.toFixed(2), totals.credit.toFixed(2), (totals.debit - totals.credit).toFixed(2)]].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trial-balance.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadTrialBalancePDF } = await import('@/lib/pdf-generator');
    await downloadTrialBalancePDF(items, periodLabel);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Trial Balance</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV} disabled={loading}>Export CSV</Button>
          <Button onClick={exportPDF} disabled={loading}>Export PDF</Button>
        </div>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Period: {periodLabel}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-5 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="hidden sm:block text-muted-foreground">{i.type}</div>
                <div className="font-mono">{i.debit.toFixed(2)}</div>
                <div className="font-mono">{i.credit.toFixed(2)}</div>
              </div>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-5 items-center p-3 text-sm bg-muted/30">
              <div className="font-medium">Totals</div>
              <div className="text-muted-foreground">{items.length} accounts</div>
              <div className="hidden sm:block" />
              <div className="font-mono">{totals.debit.toFixed(2)}</div>
              <div className="font-mono">{totals.credit.toFixed(2)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

