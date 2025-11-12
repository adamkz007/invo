"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Account = { id: string; code: string; name: string; type: string; parentId: string | null; isActive: boolean };

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET' });

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/accounting/accounts', { cache: 'no-store' });
      if (res.ok) setAccounts(await res.json());
    })();
  }, []);

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
