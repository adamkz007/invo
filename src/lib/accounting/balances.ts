import type { AccountType, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';

export type DateRange = { start?: string | null; end?: string | null };

export type AccountBalance = {
  accountId: string;
  code: string;
  name: string;
  type: AccountType;
  debit: number;
  credit: number;
};

export function entryDateFilter({ start, end }: DateRange): Prisma.JournalEntryWhereInput {
  if (!start && !end) return {};
  return {
    date: {
      ...(start ? { gte: new Date(start) } : {}),
      ...(end ? { lte: new Date(end) } : {}),
    },
  };
}

/**
 * Debit/credit totals per account, summed in the database. Returns one row per
 * account instead of one per journal line.
 */
export async function getAccountBalances(
  userId: string,
  range: DateRange,
  accountIds?: string[],
): Promise<AccountBalance[]> {
  const grouped = await prisma.journalLine.groupBy({
    by: ['accountId'],
    where: {
      ...(accountIds ? { accountId: { in: accountIds } } : {}),
      entry: { userId, ...entryDateFilter(range) },
    },
    _sum: { debit: true, credit: true },
  });
  if (grouped.length === 0) return [];

  const accounts = await prisma.account.findMany({
    where: { id: { in: grouped.map((g) => g.accountId) } },
    select: { id: true, code: true, name: true, type: true },
  });
  const byId = new Map(accounts.map((a) => [a.id, a]));

  return grouped.flatMap((g) => {
    const account = byId.get(g.accountId);
    if (!account) return [];
    return [
      {
        accountId: g.accountId,
        code: account.code,
        name: account.name,
        type: account.type,
        debit: Number(g._sum.debit || 0),
        credit: Number(g._sum.credit || 0),
      },
    ];
  });
}

/** GL accounts treated as cash: linked bank accounts plus cash/bank-named assets and code 1000. */
export async function getCashAccountIds(userId: string): Promise<string[]> {
  const [bankAccounts, cashAccounts] = await Promise.all([
    prisma.bankAccount.findMany({ where: { userId }, select: { glAccountId: true } }),
    prisma.account.findMany({
      where: {
        userId,
        type: 'ASSET',
        OR: [
          { name: { contains: 'Cash', mode: 'insensitive' } },
          { name: { contains: 'Bank', mode: 'insensitive' } },
          { code: { equals: '1000' } },
        ],
      },
      select: { id: true },
    }),
  ]);

  return Array.from(
    new Set([
      ...bankAccounts.map((b) => b.glAccountId).filter((id): id is string => Boolean(id)),
      ...cashAccounts.map((a) => a.id),
    ]),
  );
}
