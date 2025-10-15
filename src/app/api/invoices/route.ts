import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { hasReachedLimit, hasTrialExpired, PLAN_LIMITS } from '@/lib/stripe';
import type { InvoiceFormValues } from '@/types';
import { toDecimal, toNumber } from '@/lib/decimal';

const MAX_PAGE_SIZE = 50;
const DEFAULT_PAGE_SIZE = 20;
const INVOICE_TAG = (userId: string) => `invoices:${userId}`;
const DASHBOARD_TAG = (userId: string) => `dashboard:${userId}`;

type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  total: number;
  paidAmount: number;
  customer: {
    id: string;
    name: string;
  } | null;
};

type InvoiceListResponse = {
  data: InvoiceListItem[];
  nextCursor?: string;
  totalCount: number;
};

type ParsedParams = {
  cursor?: string;
  size: number;
  status?: InvoiceStatus;
  search?: string;
};

function parseParams(req: NextRequest): ParsedParams {
  const searchParams = req.nextUrl.searchParams;
  const cursor = searchParams.get('cursor') ?? undefined;
  const search = searchParams.get('search')?.trim() || undefined;

  const limitParam = Number(searchParams.get('limit'));
  const size =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  const statusParam = searchParams.get('status');
  const status = statusParam && Object.values(InvoiceStatus).includes(statusParam as InvoiceStatus)
    ? (statusParam as InvoiceStatus)
    : undefined;

  return { cursor, size, status, search };
}

function buildWhere(userId: string, params: ParsedParams): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = { userId };

  if (params.status) {
    where.status = params.status;
  }

  if (params.search) {
    where.OR = [
      { invoiceNumber: { contains: params.search, mode: 'insensitive' } },
      { customer: { name: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  return where;
}

function serialiseInvoice(invoice: {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: Date;
  dueDate: Date;
  total: Prisma.Decimal | number | string;
  paidAmount: Prisma.Decimal | number | string;
  customer: { id: string; name: string } | null;
}): InvoiceListItem {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    total: toNumber(invoice.total),
    paidAmount: toNumber(invoice.paidAmount),
    customer: invoice.customer,
  };
}

async function ensureUsageWithinLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      subscriptionStatus: true,
      trialEndDate: true,
    },
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const subscriptionStatus = user.subscriptionStatus || 'FREE';
  const trialExpired = hasTrialExpired(user.trialEndDate);

  if (trialExpired && subscriptionStatus === 'TRIAL') {
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: 'FREE' },
    });
  }

  if (subscriptionStatus === 'ACTIVE') {
    return null;
  }

  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  const invoiceCount = await prisma.invoice.count({
    where: {
      userId,
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });

  const reachedLimit = hasReachedLimit(
    subscriptionStatus,
    'invoicesPerMonth',
    invoiceCount,
  );

  if (reachedLimit) {
    return NextResponse.json(
      {
        error: 'You have reached your monthly invoice limit. Please upgrade to premium or wait until next month.',
        limitReached: true,
        currentCount: invoiceCount,
        limit: PLAN_LIMITS.FREE.invoicesPerMonth,
      },
      { status: 403 },
    );
  }

  return null;
}

async function generateInvoiceNumber(tx: Prisma.TransactionClient, userId: string) {
  const latest = await tx.invoice.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    select: { invoiceNumber: true },
  });

  const timestamp = Date.now().toString().slice(-4);
  if (!latest?.invoiceNumber) {
    return `INV-0001-${timestamp}`;
  }

  const match = latest.invoiceNumber.match(/INV-(\d+)-/);
  const sequential = match?.[1] ? parseInt(match[1], 10) + 1 : 1;
  const padded = sequential.toString().padStart(4, '0');
  return `INV-${padded}-${timestamp}`;
}

export async function GET(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = parseParams(req);
  const where = buildWhere(user.id, params);

  try {
    const [records, totalCount] = await Promise.all([
      prisma.invoice.findMany({
        where,
        take: params.size + 1,
        ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          issueDate: true,
          dueDate: true,
          total: true,
          paidAmount: true,
          customer: {
            select: { id: true, name: true },
          },
        },
      }),
      prisma.invoice.count({ where }),
    ]);

    let nextCursor: string | undefined;
    if (records.length > params.size) {
      const nextItem = records.pop();
      nextCursor = nextItem?.id;
    }

    const payload: InvoiceListResponse = {
      data: records.map(serialiseInvoice),
      nextCursor,
      totalCount,
    };

    return NextResponse.json(payload, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=60',
      },
    });
  } catch (error) {
    console.error('Failed to load invoices', error);
    return NextResponse.json({ error: 'Failed to load invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const limitResponse = await ensureUsageWithinLimits(user.id);
  if (limitResponse) {
    return limitResponse;
  }

  try {
    const payload = (await req.json()) as InvoiceFormValues & {
      items: Array<
        InvoiceFormValues['items'][number] & {
          disableStockManagement?: boolean;
        }
      >;
    };

    if (!Array.isArray(payload.items) || payload.items.length === 0) {
      return NextResponse.json({ error: 'Invoice must contain at least one item' }, { status: 400 });
    }

    const createdInvoice = await prisma.$transaction(async (tx) => {
      const invoiceNumber = await generateInvoiceNumber(tx, user.id);

      const itemsPayload = payload.items;
      const subtotal = itemsPayload.reduce(
        (sum, item) =>
          sum.plus(toDecimal(item.unitPrice || 0).times(item.quantity || 0)),
        new Prisma.Decimal(0),
      );

      const taxRateDecimal = toDecimal(payload.taxRate ?? 0);
      const discountRateDecimal = toDecimal(payload.discountRate ?? 0);
      const taxAmount = subtotal.times(taxRateDecimal).dividedBy(100);
      const discountAmount = subtotal.times(discountRateDecimal).dividedBy(100);
      const total = subtotal.plus(taxAmount).minus(discountAmount);
      const paidAmount = toDecimal(payload.paidAmount ?? 0);

      const status =
        payload.status && Object.values(InvoiceStatus).includes(payload.status as InvoiceStatus)
          ? (payload.status as InvoiceStatus)
          : InvoiceStatus.DRAFT;

      const productIds = Array.from(new Set(itemsPayload.map((item) => item.productId)));
      const products = await tx.product.findMany({
        where: {
          id: { in: productIds },
          userId: user.id,
        },
        select: {
          id: true,
          quantity: true,
          disableStockManagement: true,
        },
      });

      const productMap = new Map(products.map((product) => [product.id, product]));

      for (const item of itemsPayload) {
        const product = productMap.get(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (!product.disableStockManagement) {
          const remaining = product.quantity - item.quantity;
          if (remaining < 0) {
            throw new Error(`Insufficient stock for product ${item.productId}`);
          }
          product.quantity = remaining;
        }
      }

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          issueDate: payload.issueDate ?? new Date(),
          dueDate: payload.dueDate,
          status,
          subtotal,
          taxRate: taxRateDecimal,
          taxAmount,
          discountRate: discountRateDecimal,
          discountAmount,
          total,
          paidAmount,
          notes: payload.notes,
          userId: user.id,
          customerId: payload.customerId,
          items: {
            create: itemsPayload.map((item) => ({
              quantity: item.quantity,
              unitPrice: toDecimal(item.unitPrice),
              description: item.description ?? '',
              productId: item.productId,
            })),
          },
        },
        select: {
          id: true,
          invoiceNumber: true,
          status: true,
          issueDate: true,
          dueDate: true,
          total: true,
          paidAmount: true,
          customer: {
            select: { id: true, name: true },
          },
        },
      });

      await Promise.all(
        Array.from(productMap.values())
          .filter((product) => !product.disableStockManagement)
          .map((product) =>
            tx.product.update({
              where: { id: product.id },
              data: { quantity: product.quantity },
            }),
          ),
      );

      return invoice;
    });

    revalidateTag(INVOICE_TAG(user.id));
    revalidateTag(DASHBOARD_TAG(user.id));

    return NextResponse.json(serialiseInvoice(createdInvoice), { status: 201 });
  } catch (error) {
    console.error('Failed to create invoice', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 },
    );
  }
}
