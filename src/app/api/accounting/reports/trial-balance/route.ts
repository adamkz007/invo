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
    const grouped = await prisma.journalLine.groupBy({
      by: ['accountId'],
      where: {
        entry: {
          userId: user.id,
          ...dateFilter,
        },
      },
      _sum: { debit: true, credit: true },
    });

    const accountIds = grouped.map(g => g.accountId);
    const accounts = await prisma.account.findMany({
      where: { id: { in: accountIds } },
      select: { id: true, code: true, name: true, type: true },
    });
    const accMap = new Map(accounts.map(a => [a.id, a]));

    const items = grouped.map(g => {
      const acc = accMap.get(g.accountId);
      const debit = Number(g._sum.debit || 0);
      const credit = Number(g._sum.credit || 0);
      const balance = debit - credit;
      return {
        accountId: g.accountId,
        code: acc?.code || '',
        name: acc?.name || '',
        type: acc?.type || 'ASSET',
        debit,
        credit,
        balance,
      };
    }).sort((a, b) => a.code.localeCompare(b.code));

    const totals = items.reduce((t, i) => ({ debit: t.debit + i.debit, credit: t.credit + i.credit }), { debit: 0, credit: 0 });

    return NextResponse.json({ items, totals });
  } catch (e) {
    console.error('Trial Balance GET failed', e);
    return NextResponse.json({ error: 'Failed to load trial balance' }, { status: 500 });
  }
}

