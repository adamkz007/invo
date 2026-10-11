import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { toNumber } from '@/lib/decimal';
import { getCashAccountIds } from '@/lib/accounting/balances';

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

    const [openInvoices, invoicesInRange, expensesInRange, cashAccountIds] = await Promise.all([
      // Open invoices for accounts receivable (not yet fully paid)
      prisma.invoice.aggregate({
        where: { userId: user.id, status: { in: ['DRAFT', 'SENT', 'PARTIAL', 'OVERDUE'] } },
        _sum: { total: true, paidAmount: true },
      }),
      // All invoices in date range for revenue (excluding cancelled and drafts)
      prisma.invoice.aggregate({
        where: {
          userId: user.id,
          status: { notIn: ['CANCELLED', 'DRAFT'] },
          ...(invoicesDateWhere as any),
        },
        _sum: { total: true },
      }),
      prisma.expense.aggregate({
        where: { userId: user.id, ...(expensesDateWhere as any) },
        _sum: { total: true },
      }),
      getCashAccountIds(user.id),
    ]);

    const accountsReceivableTotal = toNumber(openInvoices._sum.total || 0) - toNumber(openInvoices._sum.paidAmount || 0);
    // Revenue now reflects total amount invoiced (excluding cancelled and draft invoices)
    const revenueTotal = toNumber(invoicesInRange._sum.total || 0);
    const expensesTotal = toNumber(expensesInRange._sum.total || 0);

    // Cash balance as-of end date (or now if not provided)
    const cashAsOf = end ?? new Date();
    let cashBalance = 0;
    if (cashAccountIds.length > 0) {
      const cash = await prisma.journalLine.aggregate({
        where: { accountId: { in: cashAccountIds }, entry: { userId: user.id, date: { lte: cashAsOf } } },
        _sum: { debit: true, credit: true },
      });
      cashBalance = Number(cash._sum.debit || 0) - Number(cash._sum.credit || 0);
    }

    return NextResponse.json({ accountsReceivableTotal, revenueMonth: revenueTotal, cashBalance, expensesMonth: expensesTotal });
  } catch (error) {
    console.error('Failed to load accounting metrics', error);
    return NextResponse.json({ error: 'Failed to load accounting metrics' }, { status: 500 });
  }
}
