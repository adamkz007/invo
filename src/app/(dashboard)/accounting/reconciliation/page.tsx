"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type BankAccount = { id: string; name: string; glAccountId: string | null };
type BankTx = { id: string; date: string; amount: string; description: string; status: string };

export default function ReconciliationPage() {
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [selected, setSelected] = useState<string>('');
  const [csvText, setCsvText] = useState('');
  const [importing, setImporting] = useState(false);
  const [transactions, setTransactions] = useState<BankTx[]>([]);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/accounting/bank/accounts');
      if (res.ok) setAccounts(await res.json());
    })();
  }, []);

  async function importCsv() {
    if (!selected || !csvText.trim()) return;
    setImporting(true);
    const res = await fetch('/api/accounting/bank/import', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankAccountId: selected, csv: csvText }),
    });
    setImporting(false);
    if (res.ok) {
      await loadTransactions();
      setCsvText('');
    }
  }

  async function loadTransactions() {
    if (!selected) return;
    const glId = accounts.find(a => a.id === selected)?.glAccountId;
    if (!glId) return;
    const res = await fetch(`/api/accounting/ledger?accountId=${glId}&limit=50`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setTransactions(data.entries.map((e: any) => ({ id: e.id, date: e.date, amount: e.lines?.[0]?.debit || e.lines?.[0]?.credit || '0', description: e.memo || e.source, status: e.status })));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Bank Reconciliation</h1>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Import CSV</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 p-4">
          <Select value={selected} onValueChange={(v) => setSelected(v)}>
            <SelectTrigger><SelectValue placeholder="Select cash/bank account" /></SelectTrigger>
            <SelectContent>
              {accounts.map(a => (<SelectItem key={a.id} value={a.id}>{a.name}</SelectItem>))}
            </SelectContent>
          </Select>
          <textarea className="min-h-[120px] rounded-md border p-2 text-sm" placeholder="Paste CSV with headers: Date,Description,Amount" value={csvText} onChange={(e) => setCsvText(e.target.value)} />
          <Button onClick={importCsv} disabled={importing} className="w-full">{importing ? 'Importing…' : 'Import'}</Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Unmatched Transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {transactions.map((t) => (
              <div key={t.id} className="grid grid-cols-2 sm:grid-cols-4 items-center p-3 text-sm">
                <div>{new Date(t.date).toLocaleDateString()}</div>
                <div className="text-muted-foreground">{t.description}</div>
                <div className="font-mono">{Number(t.amount).toFixed(2)}</div>
                <div className="text-xs">{t.status}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
