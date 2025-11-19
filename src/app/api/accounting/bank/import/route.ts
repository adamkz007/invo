import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

function parseCsv(text: string) {
  const lines = text.trim().split(/\r?\n/);
  const rows = lines.map(l => l.split(','));
  const data = [] as { date: Date; amount: number; description: string }[];
  for (const r of rows.slice(1)) {
    const [date, description, amount] = r;
    const amt = parseFloat(amount);
    if (!isNaN(amt)) data.push({ date: new Date(date), amount: amt, description: description || '' });
  }
  return data;
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  try {
    const body = await req.json();
    const { bankAccountId, csv } = body;
    const account = await prisma.bankAccount.findFirst({ where: { id: bankAccountId, userId: user.id } });
    if (!account) return NextResponse.json({ error: 'Bank account not found' }, { status: 404 });
    const rows = parseCsv(csv);
    const created = await prisma.$transaction(rows.map(r => prisma.bankTransaction.create({ data: { bankAccountId, date: r.date, amount: r.amount, description: r.description, status: 'unmatched' } })));
    return NextResponse.json({ count: created.length });
  } catch (e) {
    console.error('Bank import failed', e);
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 });
  }
}
