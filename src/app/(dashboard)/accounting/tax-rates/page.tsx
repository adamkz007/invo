"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Rate = { id: string; name: string; rate: string };

export default function TaxRatesPage() {
  const [rates, setRates] = useState<Rate[]>([]);
  const [name, setName] = useState('');
  const [rate, setRate] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch('/api/accounting/tax-rates', { cache: 'no-store' });
      if (res.ok) setRates(await res.json());
    })();
  }, []);

  async function addRate() {
    if (!name) return;
    setLoading(true);
    const res = await fetch('/api/accounting/tax-rates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, rate: Number(rate) }),
    });
    setLoading(false);
    if (res.ok) {
      const created = await res.json();
      setRates((prev) => [created, ...prev]);
      setName('');
      setRate('0');
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Tax Rates</h1>
      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Add Rate</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 p-4">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input type="number" placeholder="Rate (%)" value={rate} onChange={(e) => setRate(e.target.value)} />
          <Button onClick={addRate} disabled={loading} className="w-full">{loading ? 'Saving…' : 'Save'}</Button>
        </CardContent>
      </Card>

      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Rates</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {rates.map((r) => (
              <div key={r.id} className="grid grid-cols-2 sm:grid-cols-3 items-center p-3 text-sm">
                <div className="font-medium">{r.name}</div>
                <div className="font-mono">{Number(r.rate).toFixed(2)}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

