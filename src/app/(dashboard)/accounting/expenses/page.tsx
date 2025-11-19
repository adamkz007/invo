"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

type Expense = { id: string; vendor: string; date: string; total: string; status: string };

export default function ExpensesPage() {
  const [items, setItems] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch('/api/accounting/expenses', { cache: 'no-store' });
      if (res.ok) setItems(await res.json());
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Expenses</h1>
        <Link href="/accounting/expenses/new"><Button>New Expense</Button></Link>
      </div>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Recent</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {items.map((e) => (
              <div key={e.id} className="grid grid-cols-2 sm:grid-cols-4 items-center p-3 text-sm">
                <div className="font-medium">{e.vendor}</div>
                <div className="text-muted-foreground">{new Date(e.date).toLocaleDateString()}</div>
                <div className="font-mono">{Number(e.total).toFixed(2)}</div>
                <div className="text-xs">{e.status}</div>
              </div>
            ))}
            {!loading && items.length === 0 ? (
              <div className="p-3 text-sm text-muted-foreground">No expenses yet</div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

