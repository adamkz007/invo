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
    // Revenue from receipts, AR from invoices, expenses MTD from Expense
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [openInvoices, paidReceipts, expensesMtd] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: user.id, status: { in: ['DRAFT', 'SENT', 'PARTIAL'] } },
        select: { total: true, paidAmount: true },
      }),
      prisma.receipt.findMany({
        where: { userId: user.id },
        select: { total: true },
      }),
      prisma.expense.findMany({
        where: { userId: user.id, date: { gte: startOfMonth } },
        select: { total: true },
      }),
    ]);

    const accountsReceivableTotal = openInvoices.reduce((sum, inv) => sum + (toNumber(inv.total) - toNumber(inv.paidAmount || 0)), 0);
    const revenueMonth = paidReceipts.reduce((sum, r) => sum + toNumber(r.total), 0);

    // Cash balance placeholder (can be computed from cash accounts later)
    const cashBalance = 0;
    const expensesMonth = expensesMtd.reduce((sum, e) => sum + toNumber(e.total), 0);

    return NextResponse.json({ accountsReceivableTotal, revenueMonth, cashBalance, expensesMonth });
  } catch (error) {
    console.error('Failed to load accounting metrics', error);
    return NextResponse.json({ error: 'Failed to load accounting metrics' }, { status: 500 });
  }
}
