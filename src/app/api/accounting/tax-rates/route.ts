import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const rates = await prisma.taxRate.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } });
  return NextResponse.json(rates);
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const body = await req.json();
    const { name, rate, salesTaxAccountId, taxLiabilityAccountId } = body;
    const created = await prisma.taxRate.create({
      data: { name, rate, jurisdiction: null, salesTaxAccountId: salesTaxAccountId ?? null, taxLiabilityAccountId: taxLiabilityAccountId ?? null, userId: user.id },
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e) {
    console.error('TaxRate POST failed', e);
    return NextResponse.json({ error: 'Failed to create tax rate' }, { status: 500 });
  }
}

