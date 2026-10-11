import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { getAccountBalances } from '@/lib/accounting/balances';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;

  try {
    const items = await getAccountBalances(user.id, { start: sp.get('start'), end: sp.get('end') });

    const revenues = items.filter(i => i.type === 'REVENUE').map(i => ({ ...i, amount: i.credit - i.debit }));
    const expenses = items.filter(i => i.type === 'EXPENSE').map(i => ({ ...i, amount: i.debit - i.credit }));

    const totalRevenue = revenues.reduce((t, r) => t + r.amount, 0);
    const totalExpense = expenses.reduce((t, e) => t + e.amount, 0);
    const netIncome = totalRevenue - totalExpense;

    return NextResponse.json({ revenues, expenses, totals: { revenue: totalRevenue, expense: totalExpense, netIncome } });
  } catch (e) {
    console.error('Profit & Loss GET failed', e);
    return NextResponse.json({ error: 'Failed to load profit & loss' }, { status: 500 });
  }
}
