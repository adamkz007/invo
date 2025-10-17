import type { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/decimal';

export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 20;

export type InvoiceListItem = {
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

export type InvoiceListResponse = {
  data: InvoiceListItem[];
  nextCursor?: string;
  totalCount: number;
};

export type InvoiceListOptions = {
  cursor?: string;
  limit?: number;
  status?: InvoiceStatus;
  search?: string;
};

function buildWhere(userId: string, options: InvoiceListOptions): Prisma.InvoiceWhereInput {
  const where: Prisma.InvoiceWhereInput = { userId };

  if (options.status) {
    where.status = options.status;
  }

  if (options.search) {
    where.OR = [
      { invoiceNumber: { contains: options.search, mode: 'insensitive' } },
      { customer: { name: { contains: options.search, mode: 'insensitive' } } },
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

export async function listInvoices(
  userId: string,
  options: InvoiceListOptions = {},
): Promise<InvoiceListResponse> {
  const size =
    options.limit && Number.isFinite(options.limit)
      ? Math.min(Math.max(Math.floor(options.limit), 1), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;

  const where = buildWhere(userId, options);

  const [records, totalCount] = await Promise.all([
    prisma.invoice.findMany({
      where,
      take: size + 1,
      ...(options.cursor ? { cursor: { id: options.cursor }, skip: 1 } : {}),
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
  if (records.length > size) {
    const nextItem = records.pop();
    nextCursor = nextItem?.id;
  }

  return {
    data: records.map(serialiseInvoice),
    nextCursor,
    totalCount,
  };
}

export async function countInvoicesCreatedThisMonth(userId: string): Promise<number> {
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  firstDayOfMonth.setHours(0, 0, 0, 0);

  return prisma.invoice.count({
    where: {
      userId,
      createdAt: {
        gte: firstDayOfMonth,
      },
    },
  });
}
