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
    // Approximate metrics from existing invoices/receipts until accounting tables are populated
    const [openInvoices, paidReceipts] = await Promise.all([
      prisma.invoice.findMany({
        where: { userId: user.id, status: { in: ['DRAFT', 'SENT', 'PARTIAL'] } },
        select: { total: true, paidAmount: true },
      }),
      prisma.receipt.findMany({
        where: { userId: user.id },
        select: { total: true },
      }),
    ]);

    const accountsReceivableTotal = openInvoices.reduce((sum, inv) => sum + (toNumber(inv.total) - toNumber(inv.paidAmount || 0)), 0);
    const revenueMonth = paidReceipts.reduce((sum, r) => sum + toNumber(r.total), 0);

    // Placeholder for cash & expenses until bank/expense modules exist
    const cashBalance = 0;
    const expensesMonth = 0;

    return NextResponse.json({ accountsReceivableTotal, revenueMonth, cashBalance, expensesMonth });
  } catch (error) {
    console.error('Failed to load accounting metrics', error);
    return NextResponse.json({ error: 'Failed to load accounting metrics' }, { status: 500 });
  }
}

