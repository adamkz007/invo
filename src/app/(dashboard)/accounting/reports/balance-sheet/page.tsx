"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';

type BSItem = { accountId: string; code: string; name: string; type: string; balance: number };

export default function BalanceSheetPage() {
  const { settings } = useSettings();
  const [assets, setAssets] = useState<BSItem[]>([]);
  const [liabilities, setLiabilities] = useState<BSItem[]>([]);
  const [equity, setEquity] = useState<BSItem[]>([]);
  const [totals, setTotals] = useState<{ assets: number; liabilities: number; equity: number }>({ assets: 0, liabilities: 0, equity: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/accounting/reports/balance-sheet', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setAssets(data.assets);
        setLiabilities(data.liabilities);
        setEquity(data.equity);
        setTotals(data.totals);
      }
      setLoading(false);
    })();
  }, []);

  function exportCSV() {
    const header = ['Section','Code','Name','Balance'];
    const rows = [
      ...assets.map(i => ['Assets', i.code, i.name, i.balance.toFixed(2)]),
      ...liabilities.map(i => ['Liabilities', i.code, i.name, i.balance.toFixed(2)]),
      ...equity.map(i => ['Equity', i.code, i.name, i.balance.toFixed(2)]),
      ['Totals','','Assets', totals.assets.toFixed(2)],
      ['Totals','','Liabilities', totals.liabilities.toFixed(2)],
      ['Totals','','Equity', totals.equity.toFixed(2)],
    ];
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `balance-sheet.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadBalanceSheetPDF } = await import('@/lib/pdf-generator');
    await downloadBalanceSheetPDF(assets, liabilities, equity, 'As of Today');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Balance Sheet</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV} disabled={loading}>Export CSV</Button>
          <Button onClick={exportPDF} disabled={loading}>Export PDF</Button>
        </div>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Assets</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {assets.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="font-mono">{formatCurrency(i.balance, settings)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Liabilities</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {liabilities.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="font-mono">{formatCurrency(i.balance, settings)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Equity</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {equity.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="font-mono">{formatCurrency(i.balance, settings)}</div>
              </div>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm bg-muted/30">
              <div className="font-medium">Totals</div>
              <div />
              <div className="font-mono">{formatCurrency(totals.liabilities + totals.equity, settings)} vs Assets {formatCurrency(totals.assets, settings)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

