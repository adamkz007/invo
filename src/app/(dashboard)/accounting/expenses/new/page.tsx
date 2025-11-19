"use client"
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function NewExpensePage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('0');
  const [attachments, setAttachments] = useState('');
  const [method, setMethod] = useState<'CASH' | 'AP'>('CASH');
  const total = parseFloat(amount || '0') || 0;
  const taxAmount = 0;
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!vendor) return;
    setLoading(true);
    const res = await fetch('/api/accounting/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vendor, subtotal: total, taxRate: 0, taxAmount, total, attachments, method }),
    });
    setLoading(false);
    if (res.ok) {
      setVendor('');
      setAmount('0');
      setAttachments('');
      setMethod('CASH');
      showToast({ variant: 'success', message: 'Expense recorded successfully' });
      setTimeout(() => {
        router.push('/accounting/expenses');
        router.refresh();
      }, 800);
    } else {
      showToast({ variant: 'error', message: 'Failed to save expense' });
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Record Expense</h1>
      <Card className="rounded-xl">
        <CardHeader className="p-4">
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-2 p-4">
          <Input placeholder="Vendor" value={vendor} onChange={(e) => setVendor(e.target.value)} />
          <Input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <Input placeholder="Attachments (URLs)" value={attachments} onChange={(e) => setAttachments(e.target.value)} />
          <Select value={method} onValueChange={(v) => setMethod(v as 'CASH' | 'AP')}>
            <SelectTrigger><SelectValue placeholder="Payment Method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="CASH">Cash</SelectItem>
              <SelectItem value="AP">Accounts Payable</SelectItem>
            </SelectContent>
          </Select>
          <div className="text-sm">Amount: <span className="font-mono">{total.toFixed(2)}</span></div>
          <Button onClick={submit} disabled={loading} className="w-full">{loading ? 'Saving…' : 'Save'}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
