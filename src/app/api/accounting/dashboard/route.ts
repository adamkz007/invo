import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { toNumber } from '@/lib/decimal';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const sp = req.nextUrl.searchParams;
    const startParam = sp.get('start');
    const endParam = sp.get('end');

    const start = startParam ? new Date(startParam) : null;
    const end = endParam ? new Date(endParam) : null;

    const invoicesDateWhere = start || end ? {
      issueDate: {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      },
    } : {};

    const expensesDateWhere = start || end ? {
      date: {
        ...(start ? { gte: start } : {}),
        ...(end ? { lte: end } : {}),
      },
    } : {};

    const [openInvoices, invoicesInRange, expensesInRange, bankAccounts] = await Promise.all([
      // Open invoices for accounts receivable (not yet fully paid)
      prisma.invoice.findMany({
        where: { userId: user.id, status: { in: ['DRAFT', 'SENT', 'PARTIAL', 'OVERDUE'] } },
        select: { total: true, paidAmount: true },
      }),
      // All invoices in date range for revenue (excluding cancelled and drafts)
      prisma.invoice.findMany({
        where: { 
          userId: user.id, 
          status: { notIn: ['CANCELLED', 'DRAFT'] },
          ...(invoicesDateWhere as any) 
        },
        select: { total: true },
      }),
      prisma.expense.findMany({
        where: { userId: user.id, ...(expensesDateWhere as any) },
        select: { total: true },
      }),
      prisma.bankAccount.findMany({ where: { userId: user.id }, select: { glAccountId: true } }),
    ]);

    const accountsReceivableTotal = openInvoices.reduce((sum, inv) => sum + (toNumber(inv.total) - toNumber(inv.paidAmount || 0)), 0);
    // Revenue now reflects total amount invoiced (excluding cancelled and draft invoices)
    const revenueTotal = invoicesInRange.reduce((sum, inv) => sum + toNumber(inv.total), 0);
    const expensesTotal = expensesInRange.reduce((sum, e) => sum + toNumber(e.total), 0);

    // Cash balance as-of end date (or now if not provided)
    const cashAsOf = end ?? new Date();
    const cashAccountIds = bankAccounts.map(b => b.glAccountId).filter(Boolean) as string[];
    const additionalCash = await prisma.account.findMany({
      where: { userId: user.id, type: 'ASSET', OR: [
        { name: { contains: 'Cash', mode: 'insensitive' } },
        { name: { contains: 'Bank', mode: 'insensitive' } },
        { code: { equals: '1000' } },
      ] },
      select: { id: true },
    });
    const allCashIds = Array.from(new Set([...
      cashAccountIds,
      ...additionalCash.map(a => a.id),
    ]));

    let cashBalance = 0;
    if (allCashIds.length > 0) {
      const lines = await prisma.journalLine.findMany({
        where: { accountId: { in: allCashIds }, entry: { userId: user.id, date: { lte: cashAsOf } } },
        select: { debit: true, credit: true },
      });
      cashBalance = lines.reduce((sum, l) => sum + Number(l.debit || 0) - Number(l.credit || 0), 0);
    }

    return NextResponse.json({ accountsReceivableTotal, revenueMonth: revenueTotal, cashBalance, expensesMonth: expensesTotal });
  } catch (error) {
    console.error('Failed to load accounting metrics', error);
    return NextResponse.json({ error: 'Failed to load accounting metrics' }, { status: 500 });
  }
}
