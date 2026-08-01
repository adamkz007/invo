import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { safeErrorResponse } from '@/lib/api-error';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const headers = new Headers(request.headers);
    const moduleEnabled = headers.get('x-receipts-module-enabled');

    if (moduleEnabled === 'false') {
      return NextResponse.json(
        { error: 'Receipt not found or module disabled' },
        { status: 404 },
      );
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const receipt = await prisma.receipt.findFirst({
      where: { id, userId: user.id },
      include: {
        items: { include: { product: true } },
      },
    });

    if (!receipt) {
      return NextResponse.json({ error: 'Receipt not found' }, { status: 404 });
    }

    return NextResponse.json({
      ...receipt,
      invoiceId: null,
      orderNumber: null,
    });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch receipt');
  }
}
