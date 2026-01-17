"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';

type CFItem = { accountId: string; code: string; name: string; delta: number };

export default function CashFlowPage() {
  const { settings } = useSettings();
  const [items, setItems] = useState<CFItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/accounting/reports/cash-flow', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        setTotal(data.total);
      }
      setLoading(false);
    })();
  }, []);

  function exportCSV() {
    const header = ['Code','Name','Change'];
    const rows = items.map(i => [i.code, i.name, i.delta.toFixed(2)]);
    const csv = [header, ...rows, ['Total','',''+total.toFixed(2)]].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cash-flow.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadCashFlowPDF } = await import('@/lib/pdf-generator');
    await downloadCashFlowPDF(items, total, 'All Time');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Cash Flow</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV} disabled={loading}>Export CSV</Button>
          <Button onClick={exportPDF} disabled={loading}>Export PDF</Button>
        </div>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Net Change in Cash</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="font-mono">{formatCurrency(i.delta, settings)}</div>
              </div>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm bg-muted/30">
              <div className="font-medium">Total</div>
              <div />
              <div className="font-mono">{formatCurrency(total, settings)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

