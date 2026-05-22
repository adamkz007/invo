"use client"

import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { Plus, ChevronDown, ChevronUp } from 'lucide-react';

type Account = { id: string; code: string; name: string; type: string; parentId: string | null; isActive: boolean };
type TBItem = { accountId: string; code: string; name: string; type: string; debit: number; credit: number; balance: number };

const ACCOUNT_TYPES = ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'] as const;

function typeColor(type: string) {
  switch (type) {
    case 'ASSET': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    case 'LIABILITY': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
    case 'EQUITY': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
    case 'REVENUE': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    case 'EXPENSE': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
    default: return '';
  }
}

export default function AccountsPage() {
  const { settings } = useSettings();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [tbItems, setTbItems] = useState<TBItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: '', name: '', type: 'ASSET' });
  const [expandedType, setExpandedType] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/accounting/accounts', { cache: 'no-store' });
      if (res.ok) setAccounts(await res.json());
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/accounting/reports/trial-balance', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setTbItems(data.items);
      }
    })();
  }, []);

  const grouped = useMemo(() => {
    const balanceMap = new Map(tbItems.map((i) => [i.accountId, i]));
    const groups: Record<string, { accounts: (Account & { balance: number })[]; total: number }> = {};
    for (const type of ACCOUNT_TYPES) {
      groups[type] = { accounts: [], total: 0 };
    }
    for (const acc of accounts) {
      const tb = balanceMap.get(acc.id);
      const balance = tb ? (acc.type === 'ASSET' || acc.type === 'EXPENSE' ? tb.debit - tb.credit : tb.credit - tb.debit) : 0;
      groups[acc.type] = groups[acc.type] || { accounts: [], total: 0 };
      groups[acc.type].accounts.push({ ...acc, balance });
      groups[acc.type].total += balance;
    }
    for (const type of ACCOUNT_TYPES) {
      groups[type].accounts.sort((a, b) => a.code.localeCompare(b.code));
    }
    return groups;
  }, [accounts, tbItems]);

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
      setShowForm(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Chart of Accounts</h1>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>

      {showForm && (
        <Card className="rounded-xl">
          <CardContent className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-4 sm:items-end">
            <Input placeholder="Code (e.g., 1000)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input placeholder="Account name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
              <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
              <SelectContent>
                {ACCOUNT_TYPES.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={createAccount} className="w-full">Create</Button>
          </CardContent>
        </Card>
      )}

      <div className="space-y-2">
        {ACCOUNT_TYPES.map((type) => {
          const group = grouped[type];
          if (!group || group.accounts.length === 0) return null;
          const isExpanded = expandedType === type;
          return (
            <Card key={type} className="rounded-xl overflow-hidden">
              <div
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/20"
                onClick={() => setExpandedType(isExpanded ? null : type)}
              >
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={`text-xs ${typeColor(type)}`}>{type}</Badge>
                  <span className="text-sm text-muted-foreground">{group.accounts.length} accounts</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono font-medium">{formatCurrency(group.total, settings)}</span>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                </div>
              </div>
              {isExpanded && (
                <div className="border-t divide-y">
                  {group.accounts.map((acc) => (
                    <div key={acc.id} className="flex items-center justify-between p-3 text-sm">
                      <div className="min-w-0 flex-1">
                        <span className="font-medium">{acc.code}</span>
                        <span className="text-muted-foreground ml-2">{acc.name}</span>
                      </div>
                      <span className="font-mono shrink-0 ml-2">{formatCurrency(acc.balance, settings)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
