"use client"
import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';

type Account = { id: string; code: string; name: string; type: string; parentId: string | null; isActive: boolean };
type TBItem = { accountId: string; code: string; name: string; type: string; debit: number; credit: number; balance: number };

export default function AccountsPage() {
  const { settings } = useSettings();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET' });
  const [tbItems, setTbItems] = useState<TBItem[]>([]);
  const [loadingTB, setLoadingTB] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/accounting/accounts', { cache: 'no-store' });
      if (res.ok) setAccounts(await res.json());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      setLoadingTB(true);
      const res = await fetch('/api/accounting/reports/trial-balance', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTbItems(data.items);
      }
      setLoadingTB(false);
    })();
  }, []);

  const grouped = useMemo(() => {
    const groups: Record<string, { total: number; items: TBItem[] }> = {};
    for (const i of tbItems) {
      const t = i.type;
      const amount = t === 'ASSET' ? i.balance : (t === 'LIABILITY' || t === 'EQUITY' ? -i.balance : (t === 'REVENUE' ? i.credit - i.debit : i.debit - i.credit));
      const g = groups[t] || { total: 0, items: [] };
      g.total += amount;
      g.items.push({ ...i, balance: amount });
      groups[t] = g;
    }
    return groups;
  }, [tbItems]);

  async function createAccount() {
    if (!form.code || !form.name) return;
    const res = await fetch('/api/accounting/accounts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const created = await res.json();
      setAccounts((prev) => [created, ...prev]);
      setForm({ code: '', name: '', type: 'ASSET' });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Chart of Accounts</h1>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Aggregated Balances</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {(['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'] as const).map((t) => (
              <div key={t}>
                <div className="flex items-center justify-between p-3 text-sm">
                  <div className="font-medium">{t}</div>
                  <div className="font-mono">{formatCurrency(grouped[t]?.total || 0, settings)}</div>
                </div>
                <div className="divide-y">
                  {(grouped[t]?.items || []).map((i) => (
                    <div key={i.accountId} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-xs">
                      <div className="font-medium">{i.code}</div>
                      <div className="text-muted-foreground">{i.name}</div>
                      <div className="font-mono">{formatCurrency(i.balance, settings)}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Add Account</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 p-4">
          <Input placeholder="Code (e.g., 1000)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          <Input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
            <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
            <SelectContent>
              {['ASSET','LIABILITY','EQUITY','REVENUE','EXPENSE'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={createAccount} className="w-full">Create</Button>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-2">
        {accounts.map((acc) => (
          <Card key={acc.id} className="rounded-xl">
            <CardContent className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm font-medium">{acc.code} · {acc.name}</div>
                <div className="text-xs text-muted-foreground">{acc.type}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
