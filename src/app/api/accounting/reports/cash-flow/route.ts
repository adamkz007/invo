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
    const bankAccounts = await prisma.bankAccount.findMany({ where: { userId: user.id }, select: { glAccountId: true } });
    const cashAccountIds = bankAccounts.map(b => b.glAccountId).filter(Boolean) as string[];
    const additionalCash = await prisma.account.findMany({
      where: { userId: user.id, type: 'ASSET', OR: [{ name: { contains: 'Cash', mode: 'insensitive' } }, { name: { contains: 'Bank', mode: 'insensitive' } }, { code: { equals: '1000' } }] },
      select: { id: true },
    });
    const allCashIds = Array.from(new Set([...cashAccountIds, ...additionalCash.map(a => a.id)]));

    if (allCashIds.length === 0) return NextResponse.json({ items: [], total: 0 });

    const lines = await prisma.journalLine.findMany({
      where: { accountId: { in: allCashIds }, entry: { userId: user.id, ...dateFilter } },
      select: { accountId: true, debit: true, credit: true, account: { select: { code: true, name: true } } },
    });

    const map = new Map<string, { code: string; name: string; delta: number }>();
    for (const l of lines) {
      const key = l.accountId;
      const existing = map.get(key) || { code: l.account.code, name: l.account.name, delta: 0 };
      existing.delta += Number(l.debit || 0) - Number(l.credit || 0);
      map.set(key, existing);
    }

    const items = Array.from(map.entries()).map(([accountId, v]) => ({ accountId, ...v }));
    const total = items.reduce((t, i) => t + i.delta, 0);
    return NextResponse.json({ items, total });
  } catch (e) {
    console.error('Cash Flow GET failed', e);
    return NextResponse.json({ error: 'Failed to load cash flow' }, { status: 500 });
  }
}

