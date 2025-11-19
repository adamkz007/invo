import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const accounts = await prisma.bankAccount.findMany({ where: { userId: user.id }, select: { id: true, name: true, glAccountId: true } });
  return NextResponse.json(accounts);
}

