import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const asOf = sp.get('date');
  const dateFilter = asOf ? { date: { lte: new Date(asOf) } } : {};

  try {
    const lines = await prisma.journalLine.findMany({
      where: { entry: { userId: user.id, ...dateFilter } },
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
    const assets = items.filter(i => i.type === 'ASSET').map(i => ({ ...i, balance: i.debit - i.credit }));
    const liabilities = items.filter(i => i.type === 'LIABILITY').map(i => ({ ...i, balance: i.credit - i.debit }));
    const equity = items.filter(i => i.type === 'EQUITY').map(i => ({ ...i, balance: i.credit - i.debit }));

    const totalAssets = assets.reduce((t, a) => t + a.balance, 0);
    const totalLiabilities = liabilities.reduce((t, a) => t + a.balance, 0);
    const totalEquity = equity.reduce((t, a) => t + a.balance, 0);

    return NextResponse.json({ assets, liabilities, equity, totals: { assets: totalAssets, liabilities: totalLiabilities, equity: totalEquity } });
  } catch (e) {
    console.error('Balance Sheet GET failed', e);
    return NextResponse.json({ error: 'Failed to load balance sheet' }, { status: 500 });
  }
}

