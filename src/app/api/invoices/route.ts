import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { postInvoiceIssued } from '@/lib/accounting/posting';
import { getUserFromRequest } from '@/lib/auth';
import { hasReachedLimit, hasTrialExpired, PLAN_LIMITS } from '@/lib/stripe';
import type { InvoiceFormValues } from '@/types';
import { toDecimal, toNumber } from '@/lib/decimal';
import {
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  countInvoicesCreatedThisMonth,
  listInvoices,
  type InvoiceListItem,
  type InvoiceListOptions,
  type InvoiceListResponse,
} from '@/lib/data/invoices';

const INVOICE_TAG = (userId: string) => `invoices:${userId}`;
const DASHBOARD_TAG = (userId: string) => `dashboard:${userId}`;

const invoiceListCache = (userId: string) =>
  unstable_cache(
    (options: InvoiceListOptions) => listInvoices(userId, options),
    ['invoices-list', userId],
    {
      revalidate: 120,
      tags: [INVOICE_TAG(userId)],
    },
  );

function parseParams(req: NextRequest): InvoiceListOptions {
  const searchParams = req.nextUrl.searchParams;
  const cursor = searchParams.get('cursor') ?? undefined;
  const search = searchParams.get('search')?.trim() || undefined;

  const limitParam = Number(searchParams.get('limit'));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  const statusParam = searchParams.get('status');
  const status = statusParam && Object.values(InvoiceStatus).includes(statusParam as InvoiceStatus)
    ? (statusParam as InvoiceStatus)
    : undefined;

  return { cursor, limit, status, search };
}

function toInvoiceListItem(invoice: {
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

  const invoiceCount = await countInvoicesCreatedThisMonth(userId);

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
  const start = performance.now();
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const params = parseParams(req);

  try {
    const payload = await invoiceListCache(user.id)(params);

    const duration = Number((performance.now() - start).toFixed(1));

    return NextResponse.json(
      payload,
      {
        headers: {
          'Cache-Control': 'private, max-age=0, s-maxage=60',
          'Server-Timing': `total;dur=${duration}`,
        },
      },
    );
  } catch (error) {
    console.error('Failed to load invoices', error);
    const duration = Number((performance.now() - start).toFixed(1));
    return NextResponse.json(
      { error: 'Failed to load invoices' },
      { status: 500, headers: { 'Server-Timing': `total;dur=${duration}` } },
    );
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

      // Post accounting journal entry (AR/Revenue/Tax)
      try {
        await postInvoiceIssued({
          userId: user.id,
          invoiceId: invoice.id,
          total: total,
          taxAmount: taxAmount,
          accounts: {
            arCode: '1100',
            revenueCode: '4000',
            taxLiabilityCode: toNumber(taxAmount) > 0 ? '2100' : undefined,
          },
        });
      } catch (e) {
        console.warn('Accounting post (invoice issued) failed:', e);
      }

      return invoice;
    });

    revalidateTag(INVOICE_TAG(user.id));
   revalidateTag(DASHBOARD_TAG(user.id));

    return NextResponse.json(toInvoiceListItem(createdInvoice), { status: 201 });
  } catch (error) {
    console.error('Failed to create invoice', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create invoice' },
      { status: 500 },
    );
  }
}
