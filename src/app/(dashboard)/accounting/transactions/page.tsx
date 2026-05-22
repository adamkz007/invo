"use client"

import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/contexts/settings-context';
import { formatCurrency } from '@/lib/utils';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';

type JournalLine = {
  id: string;
  accountId: string;
  debit: string;
  credit: string;
  account: { code: string; name: string; type: string };
};

type Transaction = {
  id: string;
  date: string;
  memo: string | null;
  source: string;
  status: string;
  lines: JournalLine[];
};

const SOURCE_OPTIONS = ['all', 'invoice', 'receipt', 'expense', 'bank', 'manual'] as const;
const STATUS_OPTIONS = ['all', 'DRAFT', 'POSTED', 'LOCKED'] as const;

export default function TransactionsPage() {
  const { settings } = useSettings();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  async function load(reset = false) {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '30');
    if (!reset && cursor) params.set('cursor', cursor);
    if (dateFrom) params.set('start', new Date(dateFrom).toISOString());
    if (dateTo) params.set('end', new Date(dateTo + 'T23:59:59').toISOString());
    const res = await fetch(`/api/accounting/transactions?${params.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      if (reset) {
        setTransactions(data.entries);
      } else {
        setTransactions((prev) => {
          const unique = new Map(prev.map((t) => [t.id, t]));
          for (const entry of data.entries) unique.set(entry.id, entry);
          return Array.from(unique.values());
        });
      }
      setCursor(data.nextCursor);
    }
    setLoading(false);
  }

  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFrom, dateTo]);

  const filtered = useMemo(() => {
    let items = transactions;
    if (sourceFilter !== 'all') {
      items = items.filter((t) => t.source === sourceFilter);
    }
    if (statusFilter !== 'all') {
      items = items.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((t) =>
        t.memo?.toLowerCase().includes(q) ||
        t.source.toLowerCase().includes(q) ||
        t.lines.some((l) => l.account.name.toLowerCase().includes(q) || l.account.code.includes(q))
      );
    }
    return items;
  }, [transactions, sourceFilter, statusFilter, search]);

  function getAmount(t: Transaction) {
    return t.lines.reduce((sum, l) => sum + Number(l.debit), 0);
  }

  function sourceColor(source: string) {
    switch (source) {
      case 'invoice': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'receipt': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'expense': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'bank': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={showFilters ? 'bg-muted' : ''}
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {showFilters && (
        <Card className="rounded-xl">
          <CardContent className="grid grid-cols-2 gap-2 p-3 sm:grid-cols-4">
            <div>
              <label className="text-xs text-muted-foreground">Source</label>
              <Select value={sourceFilter} onValueChange={setSourceFilter}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SOURCE_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s === 'all' ? 'All Sources' : s.charAt(0).toUpperCase() + s.slice(1)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground">From</label>
              <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">To</label>
              <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="mt-1" />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="text-xs text-muted-foreground">
        {filtered.length} transaction{filtered.length !== 1 ? 's' : ''}
      </div>

      <div className="space-y-2">
        {filtered.map((t) => (
          <Card
            key={t.id}
            className="rounded-xl cursor-pointer transition-shadow hover:shadow-md"
            onClick={() => setExpandedId(expandedId === t.id ? null : t.id)}
          >
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Badge variant="secondary" className={`text-[10px] shrink-0 ${sourceColor(t.source)}`}>
                    {t.source}
                  </Badge>
                  <span className="text-sm font-medium truncate">
                    {t.memo || t.lines[0]?.account.name || 'Journal Entry'}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-sm font-mono font-medium">
                    {formatCurrency(getAmount(t), settings)}
                  </span>
                  {expandedId === t.id ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">
                  {new Date(t.date).toLocaleDateString()}
                </span>
                <Badge variant="outline" className="text-[10px]">{t.status}</Badge>
              </div>

              {expandedId === t.id && (
                <div className="mt-3 border-t pt-2 space-y-1">
                  {t.lines.map((l) => (
                    <div key={l.id} className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {l.account.code} · {l.account.name}
                      </span>
                      <span className="font-mono">
                        {Number(l.debit) > 0 ? `Dr ${formatCurrency(Number(l.debit), settings)}` : `Cr ${formatCurrency(Number(l.credit), settings)}`}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {cursor && (
        <Button onClick={() => load(false)} disabled={loading} variant="outline" className="w-full">
          {loading ? 'Loading...' : 'Load more'}
        </Button>
      )}

      {!loading && filtered.length === 0 && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          No transactions found
        </div>
      )}
    </div>
  );
}
