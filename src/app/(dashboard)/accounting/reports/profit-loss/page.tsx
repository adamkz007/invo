"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';

type PLItem = { accountId: string; code: string; name: string; type: string; amount: number };

export default function ProfitLossPage() {
  const { settings } = useSettings();
  const [revenues, setRevenues] = useState<PLItem[]>([]);
  const [expenses, setExpenses] = useState<PLItem[]>([]);
  const [totals, setTotals] = useState<{ revenue: number; expense: number; netIncome: number }>({ revenue: 0, expense: 0, netIncome: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/accounting/reports/profit-loss', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setRevenues(data.revenues);
        setExpenses(data.expenses);
        setTotals(data.totals);
      }
      setLoading(false);
    })();
  }, []);

  function exportCSV() {
    const header = ['Section','Code','Name','Amount'];
    const rows = [
      ...revenues.map(i => ['Revenue', i.code, i.name, i.amount.toFixed(2)]),
      ...expenses.map(i => ['Expense', i.code, i.name, i.amount.toFixed(2)]),
      ['Totals','','Revenue', totals.revenue.toFixed(2)],
      ['Totals','','Expense', totals.expense.toFixed(2)],
      ['Totals','','Net Income', totals.netIncome.toFixed(2)],
    ];
    const csv = [header, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `profit-loss.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function exportPDF() {
    const { downloadProfitLossPDF } = await import('@/lib/pdf-generator');
    await downloadProfitLossPDF(revenues, expenses, totals, 'All Time');
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Profit & Loss</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCSV} disabled={loading}>Export CSV</Button>
          <Button onClick={exportPDF} disabled={loading}>Export PDF</Button>
        </div>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Revenue</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {revenues.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="font-mono">{formatCurrency(i.amount, settings)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Expenses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {expenses.map((i) => (
              <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{i.code}</div>
                <div className="text-muted-foreground">{i.name}</div>
                <div className="font-mono">{formatCurrency(i.amount, settings)}</div>
              </div>
            ))}
            <div className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm bg-muted/30">
              <div className="font-medium">Net Income</div>
              <div />
              <div className="font-mono">{formatCurrency(totals.netIncome, settings)}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

