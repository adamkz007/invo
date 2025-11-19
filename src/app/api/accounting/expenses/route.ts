import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { postExpense } from '@/lib/accounting/posting';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const expenses = await prisma.expense.findMany({ where: { userId: user.id }, orderBy: { date: 'desc' }, take: 50 });
  return NextResponse.json(expenses);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { vendor, date, subtotal, taxRate, taxAmount, total, attachments, method = 'CASH' } = body;
    const created = await prisma.expense.create({
      data: {
        vendor,
        date: date ? new Date(date) : new Date(),
        subtotal,
        taxRate: taxRate ?? 0,
        taxAmount: taxAmount ?? 0,
        total,
        status: 'POSTED',
        attachments: attachments ?? null,
        userId: user.id,
      },
    });

    try {
      await postExpense({
        userId: user.id,
        expenseId: created.id,
        total: created.total,
        taxAmount: created.taxAmount,
        method: method === 'AP' ? 'AP' : 'CASH',
        accounts: { arCode: '1100', revenueCode: '4000', taxLiabilityCode: '2100', cashCode: '1000', apCode: '2000', expenseCode: '5000' },
      });
    } catch (e) {
      console.warn('Expense posting skipped', e);
    }

    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('Expense POST failed', e);
    return NextResponse.json({ error: 'Failed to create expense' }, { status: 500 });
  }
}

