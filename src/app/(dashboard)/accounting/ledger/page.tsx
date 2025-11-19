"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type Entry = {
  id: string;
  date: string;
  memo: string | null;
  source: string;
  lines: { id: string; accountId: string; debit: string; credit: string }[];
};

export default function LedgerPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [cursor, setCursor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function load() {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('limit', '20');
    if (cursor) params.set('cursor', cursor);
    const res = await fetch(`/api/accounting/ledger?${params.toString()}`, { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      setEntries((prev) => [...prev, ...data.entries]);
      setCursor(data.nextCursor);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-3">
      <h1 className="text-xl font-semibold">Ledger</h1>
      {entries.map((e) => (
        <Card key={e.id} className="rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{new Date(e.date).toLocaleDateString()} · {e.source}</div>
            </div>
            {e.memo ? <div className="text-xs text-muted-foreground mt-1">{e.memo}</div> : null}
            <div className="mt-2 grid grid-cols-1 gap-1">
              {e.lines.map((l) => (
                <div key={l.id} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{l.accountId}</span>
                  <span className="font-mono">{Number(l.debit) > 0 ? `Dr ${l.debit}` : `Cr ${l.credit}`}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {cursor && (
        <Button onClick={load} disabled={loading} className="w-full">{loading ? 'Loading…' : 'Load more'}</Button>
      )}
    </div>
  );
}
