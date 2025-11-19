import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const start = sp.get('start');
  const end = sp.get('end');

  const dateFilter = start || end ? {
    date: {
      ...(start ? { gte: new Date(start) } : {}),
      ...(end ? { lte: new Date(end) } : {}),
    },
  } : {};

  try {
    const lines = await prisma.journalLine.findMany({
      where: {
        entry: {
          userId: user.id,
          ...dateFilter,
        },
      },
      select: { accountId: true, debit: true, credit: true, account: { select: { code: true, name: true, type: true } } },
    });

    const map = new Map<string, { code: string; name: string; type: string; debit: number; credit: number }>();
    for (const l of lines) {
      const key = l.accountId;
      const existing = map.get(key) || { code: l.account.code, name: l.account.name, type: l.account.type, debit: 0, credit: 0 };
      existing.debit += Number(l.debit || 0);
      existing.credit += Number(l.credit || 0);
      map.set(key, existing);
    }

    const items = Array.from(map.entries()).map(([accountId, v]) => ({ accountId, ...v }));
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

