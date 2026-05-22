import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sp = req.nextUrl.searchParams;
  const cursor = sp.get('cursor') ?? undefined;
  const limitParam = Number(sp.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 30;
  const start = sp.get('start');
  const end = sp.get('end');

  const dateFilter = start || end ? {
    ...(start ? { gte: new Date(start) } : {}),
    ...(end ? { lte: new Date(end) } : {}),
  } : undefined;

  try {
    const entries = await prisma.journalEntry.findMany({
      where: {
        userId: user.id,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
      orderBy: { date: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        date: true,
        memo: true,
        source: true,
        status: true,
        lines: {
          select: {
            id: true,
            accountId: true,
            debit: true,
            credit: true,
            account: { select: { code: true, name: true, type: true } },
          },
        },
      },
    });

    const nextCursor = entries.length === limit ? entries[entries.length - 1].id : null;
    return NextResponse.json({ entries, nextCursor });
  } catch (e) {
    console.error('Transactions GET failed', e);
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 });
  }
}
