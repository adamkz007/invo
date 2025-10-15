import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { toDecimal, toNumber } from '@/lib/decimal';

const RECEIPTS_TAG = (userId: string) => `receipts:${userId}`;
const DASHBOARD_TAG = (userId: string) => `dashboard:${userId}`;

type ReceiptItem = {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: number;
  description: string | null;
};

type ReceiptListItem = {
  id: string;
  receiptNumber: string;
  customerName: string;
  receiptDate: string;
  paymentMethod: string;
  total: number;
  notes: string | null;
  items: ReceiptItem[];
};

type ReceiptListResponse = {
  data: ReceiptListItem[];
  nextCursor?: string;
  totalCount: number;
};

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;

function parseParams(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const cursor = searchParams.get('cursor') ?? undefined;
  const limitParam = Number(searchParams.get('limit'));
  const size =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const invoiceId = searchParams.get('invoiceId') ?? undefined;

  return { cursor, size, invoiceId };
}

function serialiseReceipt(receipt: {
  id: string;
  receiptNumber: string;
  customerName: string;
  receiptDate: Date;
  paymentMethod: string;
  total: Prisma.Decimal | number | string;
  notes: string | null;
  items: Array<{
    id: string;
    productId: string;
    quantity: number;
    unitPrice: Prisma.Decimal | number | string;
    description: string | null;
  }>;
}): ReceiptListItem {
  return {
    id: receipt.id,
    receiptNumber: receipt.receiptNumber,
    customerName: receipt.customerName,
    receiptDate: receipt.receiptDate.toISOString(),
    paymentMethod: receipt.paymentMethod,
    total: toNumber(receipt.total),
    notes: receipt.notes,
    items: receipt.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      description: item.description,
    })),
  };
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = parseParams(req);

  const where: Prisma.ReceiptWhereInput = { userId: user.id };

  if (params.invoiceId) {
    where.notes = {
      contains: params.invoiceId,
      mode: 'insensitive',
    };
  }

  try {
    const [records, totalCount] = await Promise.all([
      prisma.receipt.findMany({
        where,
        take: params.size + 1,
        ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
        orderBy: { receiptDate: 'desc' },
        include: {
          items: true,
        },
      }),
      prisma.receipt.count({ where }),
    ]);

    let nextCursor: string | undefined;
    if (records.length > params.size) {
      const nextItem = records.pop();
      nextCursor = nextItem?.id;
    }

    const payload: ReceiptListResponse = {
      data: records.map(serialiseReceipt),
      nextCursor,
      totalCount,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=120',
      },
    });
  } catch (error) {
    console.error('Failed to load receipts', error);
    return NextResponse.json({ error: 'Failed to load receipts' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const payload = await req.json();

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: 'Receipt must contain at least one item' }, { status: 400 });
    }

    const receipt = await prisma.$transaction(async (tx) => {
      const created = await tx.receipt.create({
        data: {
          receiptNumber: payload.receiptNumber ?? `RCT-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
          customerName: payload.customerName || 'Walk-in Customer',
          customerPhone: payload.customerPhone ?? null,
          receiptDate: payload.receiptDate ? new Date(payload.receiptDate) : new Date(),
          paymentMethod: payload.paymentMethod || 'CASH',
          notes: payload.notes ?? null,
          total: toDecimal(payload.total),
          userId: user.id,
          items: {
            create: payload.items.map((item: any) => ({
              quantity: item.quantity,
              unitPrice: toDecimal(item.unitPrice),
              description: item.description ?? '',
              productId: item.productId,
            })),
          },
        },
        include: {
          items: true,
        },
      });

      return created;
    });

    revalidateTag(RECEIPTS_TAG(user.id));
    revalidateTag(DASHBOARD_TAG(user.id));

    return NextResponse.json(serialiseReceipt(receipt), { status: 201 });
  } catch (error) {
    console.error('Failed to create receipt', error);
    return NextResponse.json({ error: 'Failed to create receipt' }, { status: 500 });
  }
}
