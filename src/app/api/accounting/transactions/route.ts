import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { invoiceIssuedMemo } from '@/lib/accounting/posting';

type TransactionEntry = {
  id: string;
  source: string;
  referenceId: string | null;
  memo: string | null;
};

async function enrichInvoiceIssuedMemos<T extends TransactionEntry>(
  userId: string,
  entries: T[],
): Promise<T[]> {
  const issuedInvoiceIds = entries
    .filter((entry) => entry.source === 'invoice' && entry.referenceId && entry.memo?.endsWith(' issued'))
    .map((entry) => entry.referenceId as string);

  if (issuedInvoiceIds.length === 0) {
    return entries;
  }

  const invoices = await prisma.invoice.findMany({
    where: { userId, id: { in: issuedInvoiceIds } },
    select: {
      id: true,
      customer: { select: { name: true } },
    },
  });

  const customerNameByInvoiceId = new Map(
    invoices.map((invoice) => [invoice.id, invoice.customer?.name ?? 'Customer']),
  );

  return entries.map((entry) => {
    if (entry.source !== 'invoice' || !entry.referenceId || !entry.memo?.endsWith(' issued')) {
      return entry;
    }

    const customerName = customerNameByInvoiceId.get(entry.referenceId);
    if (!customerName) {
      return entry;
    }

    return { ...entry, memo: invoiceIssuedMemo(customerName) };
  });
}

function dedupeInvoiceIssuedEntries<T extends TransactionEntry>(entries: T[]): T[] {
  const seenIssued = new Set<string>();

  return entries.filter((entry) => {
    if (entry.source !== 'invoice' || !entry.referenceId || !entry.memo?.endsWith(' issued')) {
      return true;
    }

    if (seenIssued.has(entry.referenceId)) {
      return false;
    }

    seenIssued.add(entry.referenceId);
    return true;
  });
}

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
      orderBy: [{ date: 'desc' }, { id: 'desc' }],
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        date: true,
        memo: true,
        source: true,
        referenceId: true,
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

    const dedupedEntries = dedupeInvoiceIssuedEntries(entries);
    const enrichedEntries = await enrichInvoiceIssuedMemos(user.id, dedupedEntries);
    const nextCursor = entries.length === limit ? entries[entries.length - 1].id : null;
    return NextResponse.json({ entries: enrichedEntries, nextCursor });
  } catch (e) {
    console.error('Transactions GET failed', e);
    return NextResponse.json({ error: 'Failed to load transactions' }, { status: 500 });
  }
}
