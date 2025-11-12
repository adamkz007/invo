import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const searchParams = req.nextUrl.searchParams;
  const cursor = searchParams.get('cursor') ?? undefined;
  const limitParam = Number(searchParams.get('limit'));
  const limit = Number.isFinite(limitParam) && limitParam > 0 ? Math.min(Math.floor(limitParam), 50) : 20;
  const accountId = searchParams.get('accountId') ?? undefined;

  try {
    const entries = await prisma.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        lines: {
          where: accountId ? { accountId } : {},
          select: { id: true, accountId: true, debit: true, credit: true },
        },
      },
    });
    const nextCursor = entries.length === limit ? entries[entries.length - 1].id : null;
    return NextResponse.json({ entries, nextCursor });
  } catch (e) {
    console.error('Ledger GET failed', e);
    return NextResponse.json({ error: 'Failed to load ledger' }, { status: 500 });
  }
}

