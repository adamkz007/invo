import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const accounts = await prisma.account.findMany({
      where: { userId: user.id },
      orderBy: [{ type: 'asc' }, { code: 'asc' }],
      select: { id: true, code: true, name: true, type: true, parentId: true, isActive: true },
    });
    return NextResponse.json(accounts);
  } catch (e) {
    console.error('Accounts GET failed', e);
    return NextResponse.json({ error: 'Failed to load accounts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { code, name, type, parentId } = await req.json();
  if (!code || !name || !type) {
    return NextResponse.json({ error: 'code, name, type required' }, { status: 400 });
  }
  try {
    const acc = await prisma.account.create({
      data: { code, name, type, parentId: parentId || null, userId: user.id },
      select: { id: true, code: true, name: true, type: true, parentId: true, isActive: true },
    });
    return NextResponse.json(acc, { status: 201 });
  } catch (e) {
    console.error('Accounts POST failed', e);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}

