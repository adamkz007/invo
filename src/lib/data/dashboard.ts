import { unstable_cache } from 'next/cache';
import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/decimal';

export const DASHBOARD_TAG = (userId: string) => `dashboard:${userId}`;

export interface DashboardOverview {
  periods: {
    allTime: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
    currentMonth: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
    currentYear: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
  };
  comparisons: {
    previousMonth: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
    previousYear: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
  };
  totals: {
    invoices: number;
    customers: number;
    products: number;
    inventoryValue: number;
  };
  invoiceStats: {
    amount: number;
    paid: number;
    overdue: number;
    pending: number;
    outstanding: number;
    recent: {
      id: string;
      number: string;
      customerName: string;
      amount: number;
      status: InvoiceStatus;
      issuedOn: string;
    }[];
  };
  charts: {
    monthlyRevenue: {
      month: string;
      revenue: number;
      paid: number;
      pending: number;
    }[];
    topProducts: {
      name: string;
      revenue: number;
    }[];
  };
  growth: {
    currentMonth: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
    previousMonth: {
      invoices: number;
      customers: number;
      products: number;
      revenue: number;
    };
  };
}

function getMonthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
  return { start, end };
}

function getYearRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear() + offset, 0, 1);
  const end = new Date(start.getFullYear() + 1, 0, 1);
  return { start, end };
}

function coerceDecimal(value: Prisma.Decimal | number | string | null | undefined) {
  return toNumber(value ?? 0);
}

interface EntityCountRow {
  invoices: bigint;
  customers: bigint;
  products: bigint;
}

interface InvoicePeriodRow {
  currentMonthCount: number;
  currentMonthRevenue: Prisma.Decimal;
  previousMonthCount: number;
  previousMonthRevenue: Prisma.Decimal;
  currentYearCount: number;
  currentYearRevenue: Prisma.Decimal;
  previousYearCount: number;
  previousYearRevenue: Prisma.Decimal;
}

interface EntityPeriodCountRow {
  currentMonth: number;
  previousMonth: number;
  currentYear: number;
  previousYear: number;
}

interface ReceiptPeriodRow {
  currentMonth: Prisma.Decimal;
  previousMonth: Prisma.Decimal;
  currentYear: Prisma.Decimal;
  previousYear: Prisma.Decimal;
}

async function computeDashboardOverview(userId: string): Promise<DashboardOverview> {
  const { start: currentStart, end: currentEnd } = getMonthRange(0);
  const { start: previousStart, end: previousEnd } = getMonthRange(-1);
  const { start: currentYearStart, end: currentYearEnd } = getYearRange(0);
  const { start: previousYearStart, end: previousYearEnd } = getYearRange(-1);

  const [totalsRow, products, invoiceTotals, invoiceGroups, recentInvoices, receiptTotals] = await Promise.all([
    prisma.$queryRaw<EntityCountRow[]>`
      SELECT
        (SELECT COUNT(*)::bigint FROM "Invoice" WHERE "userId" = ${userId}) AS invoices,
        (SELECT COUNT(*)::bigint FROM "Customer" WHERE "userId" = ${userId}) AS customers,
        (SELECT COUNT(*)::bigint FROM "Product" WHERE "userId" = ${userId}) AS products
    `,
    prisma.product.findMany({
      where: { userId },
      select: { id: true, price: true, quantity: true, disableStockManagement: true },
    }),
    prisma.invoice.aggregate({
      where: { userId },
      _sum: {
        total: true,
        paidAmount: true,
      },
    }),
    prisma.invoice.groupBy({
      by: ['status'],
      where: { userId },
      _sum: {
        total: true,
        paidAmount: true,
      },
    }),
    prisma.invoice.findMany({
      where: { userId },
      select: {
        id: true,
        invoiceNumber: true,
        status: true,
        issueDate: true,
        createdAt: true,
        customer: {
          select: { name: true },
        },
        total: true,
        paidAmount: true,
      },
      orderBy: { issueDate: 'desc' },
      take: 6,
    }),
    prisma.receipt.aggregate({
      where: { userId },
      _sum: {
        total: true,
      },
    }),
  ]);

  const inventoryValue = products.reduce((sum, product) => {
    if (product.disableStockManagement) return sum;
    return sum + toNumber(product.price) * product.quantity;
  }, 0);

  const statusTotals = invoiceGroups.reduce(
    (acc, group) => {
      const total = coerceDecimal(group._sum.total);
      const paid = coerceDecimal(group._sum.paidAmount);
      const outstanding = Math.max(0, total - paid);

      if (group.status === InvoiceStatus.OVERDUE) {
        acc.overdue += outstanding;
      }

      if (group.status === InvoiceStatus.SENT || group.status === InvoiceStatus.PARTIAL) {
        acc.pending += outstanding;
      }

      if (group.status !== InvoiceStatus.PAID) {
        acc.outstanding += outstanding;
      }

      return acc;
    },
    { overdue: 0, pending: 0, outstanding: 0 },
  );

  const totals = [
    Number(totalsRow[0]?.invoices ?? 0),
    Number(totalsRow[0]?.customers ?? 0),
    Number(totalsRow[0]?.products ?? 0),
  ];

  const monthlyRevenueRows = await prisma.$queryRaw<
    Array<{
      month: string;
      revenue: Prisma.Decimal;
      paid: Prisma.Decimal;
      pending: Prisma.Decimal;
    }>
  >`
    SELECT
      to_char(date_trunc('month', "issueDate"), 'Mon YYYY') AS month,
      SUM("total") AS revenue,
      SUM("paidAmount") AS paid,
      SUM(GREATEST("total" - "paidAmount", 0)) AS pending
    FROM "Invoice"
    WHERE "userId" = ${userId}
      AND "issueDate" >= (date_trunc('month', CURRENT_DATE) - interval '11 months')
    GROUP BY date_trunc('month', "issueDate")
    ORDER BY date_trunc('month', "issueDate")
  `;

  const topProductRows = await prisma.$queryRaw<
    Array<{
      name: string;
      revenue: Prisma.Decimal;
    }>
  >`
    SELECT
      p."name" AS name,
      SUM(ii."quantity" * ii."unitPrice") AS revenue
    FROM "InvoiceItem" ii
    INNER JOIN "Invoice" i ON i."id" = ii."invoiceId"
    INNER JOIN "Product" p ON p."id" = ii."productId"
    WHERE i."userId" = ${userId}
    GROUP BY p."name"
    ORDER BY revenue DESC
    LIMIT 6
  `;

  const [invoicePeriods, customerPeriods, productPeriods, receiptPeriods] = await Promise.all([
    prisma.$queryRaw<InvoicePeriodRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE "issueDate" >= ${currentStart} AND "issueDate" < ${currentEnd})::int AS "currentMonthCount",
        COALESCE(SUM("total") FILTER (WHERE "issueDate" >= ${currentStart} AND "issueDate" < ${currentEnd}), 0) AS "currentMonthRevenue",
        COUNT(*) FILTER (WHERE "issueDate" >= ${previousStart} AND "issueDate" < ${previousEnd})::int AS "previousMonthCount",
        COALESCE(SUM("total") FILTER (WHERE "issueDate" >= ${previousStart} AND "issueDate" < ${previousEnd}), 0) AS "previousMonthRevenue",
        COUNT(*) FILTER (WHERE "issueDate" >= ${currentYearStart} AND "issueDate" < ${currentYearEnd})::int AS "currentYearCount",
        COALESCE(SUM("total") FILTER (WHERE "issueDate" >= ${currentYearStart} AND "issueDate" < ${currentYearEnd}), 0) AS "currentYearRevenue",
        COUNT(*) FILTER (WHERE "issueDate" >= ${previousYearStart} AND "issueDate" < ${previousYearEnd})::int AS "previousYearCount",
        COALESCE(SUM("total") FILTER (WHERE "issueDate" >= ${previousYearStart} AND "issueDate" < ${previousYearEnd}), 0) AS "previousYearRevenue"
      FROM "Invoice"
      WHERE "userId" = ${userId}
    `,
    prisma.$queryRaw<EntityPeriodCountRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= ${currentStart} AND "createdAt" < ${currentEnd})::int AS "currentMonth",
        COUNT(*) FILTER (WHERE "createdAt" >= ${previousStart} AND "createdAt" < ${previousEnd})::int AS "previousMonth",
        COUNT(*) FILTER (WHERE "createdAt" >= ${currentYearStart} AND "createdAt" < ${currentYearEnd})::int AS "currentYear",
        COUNT(*) FILTER (WHERE "createdAt" >= ${previousYearStart} AND "createdAt" < ${previousYearEnd})::int AS "previousYear"
      FROM "Customer"
      WHERE "userId" = ${userId}
    `,
    prisma.$queryRaw<EntityPeriodCountRow[]>`
      SELECT
        COUNT(*) FILTER (WHERE "createdAt" >= ${currentStart} AND "createdAt" < ${currentEnd})::int AS "currentMonth",
        COUNT(*) FILTER (WHERE "createdAt" >= ${previousStart} AND "createdAt" < ${previousEnd})::int AS "previousMonth",
        COUNT(*) FILTER (WHERE "createdAt" >= ${currentYearStart} AND "createdAt" < ${currentYearEnd})::int AS "currentYear",
        COUNT(*) FILTER (WHERE "createdAt" >= ${previousYearStart} AND "createdAt" < ${previousYearEnd})::int AS "previousYear"
      FROM "Product"
      WHERE "userId" = ${userId}
    `,
    prisma.$queryRaw<ReceiptPeriodRow[]>`
      SELECT
        COALESCE(SUM("total") FILTER (WHERE "receiptDate" >= ${currentStart} AND "receiptDate" < ${currentEnd}), 0) AS "currentMonth",
        COALESCE(SUM("total") FILTER (WHERE "receiptDate" >= ${previousStart} AND "receiptDate" < ${previousEnd}), 0) AS "previousMonth",
        COALESCE(SUM("total") FILTER (WHERE "receiptDate" >= ${currentYearStart} AND "receiptDate" < ${currentYearEnd}), 0) AS "currentYear",
        COALESCE(SUM("total") FILTER (WHERE "receiptDate" >= ${previousYearStart} AND "receiptDate" < ${previousYearEnd}), 0) AS "previousYear"
      FROM "Receipt"
      WHERE "userId" = ${userId}
    `,
  ]);

  const invoicePeriod = invoicePeriods[0] ?? {
    currentMonthCount: 0,
    currentMonthRevenue: new Prisma.Decimal(0),
    previousMonthCount: 0,
    previousMonthRevenue: new Prisma.Decimal(0),
    currentYearCount: 0,
    currentYearRevenue: new Prisma.Decimal(0),
    previousYearCount: 0,
    previousYearRevenue: new Prisma.Decimal(0),
  };
  const customerPeriod = customerPeriods[0] ?? {
    currentMonth: 0,
    previousMonth: 0,
    currentYear: 0,
    previousYear: 0,
  };
  const productPeriod = productPeriods[0] ?? {
    currentMonth: 0,
    previousMonth: 0,
    currentYear: 0,
    previousYear: 0,
  };
  const receiptPeriod = receiptPeriods[0] ?? {
    currentMonth: new Prisma.Decimal(0),
    previousMonth: new Prisma.Decimal(0),
    currentYear: new Prisma.Decimal(0),
    previousYear: new Prisma.Decimal(0),
  };

  const allTimeRevenue = coerceDecimal(invoiceTotals._sum.total) + coerceDecimal(receiptTotals._sum.total);
  const currentMonthRevenue =
    coerceDecimal(invoicePeriod.currentMonthRevenue) + coerceDecimal(receiptPeriod.currentMonth);
  const previousMonthRevenue =
    coerceDecimal(invoicePeriod.previousMonthRevenue) + coerceDecimal(receiptPeriod.previousMonth);
  const currentYearRevenue =
    coerceDecimal(invoicePeriod.currentYearRevenue) + coerceDecimal(receiptPeriod.currentYear);
  const previousYearRevenue =
    coerceDecimal(invoicePeriod.previousYearRevenue) + coerceDecimal(receiptPeriod.previousYear);

  return {
    periods: {
      allTime: {
        invoices: totals[0],
        customers: totals[1],
        products: totals[2],
        revenue: allTimeRevenue,
      },
      currentMonth: {
        invoices: invoicePeriod.currentMonthCount,
        customers: customerPeriod.currentMonth,
        products: productPeriod.currentMonth,
        revenue: currentMonthRevenue,
      },
      currentYear: {
        invoices: invoicePeriod.currentYearCount,
        customers: customerPeriod.currentYear,
        products: productPeriod.currentYear,
        revenue: currentYearRevenue,
      },
    },
    comparisons: {
      previousMonth: {
        invoices: invoicePeriod.previousMonthCount,
        customers: customerPeriod.previousMonth,
        products: productPeriod.previousMonth,
        revenue: previousMonthRevenue,
      },
      previousYear: {
        invoices: invoicePeriod.previousYearCount,
        customers: customerPeriod.previousYear,
        products: productPeriod.previousYear,
        revenue: previousYearRevenue,
      },
    },
    totals: {
      invoices: totals[0],
      customers: totals[1],
      products: totals[2],
      inventoryValue,
    },
    invoiceStats: {
      amount: allTimeRevenue,
      paid: coerceDecimal(invoiceTotals._sum.paidAmount) + coerceDecimal(receiptTotals._sum.total),
      overdue: statusTotals.overdue,
      pending: statusTotals.pending,
      outstanding: statusTotals.outstanding,
      recent: recentInvoices.map((invoice) => ({
        id: invoice.id,
        number: invoice.invoiceNumber,
        customerName: invoice.customer?.name ?? 'Unknown customer',
        amount: coerceDecimal(invoice.total),
        status: invoice.status,
        issuedOn: invoice.issueDate ? invoice.issueDate.toISOString() : new Date().toISOString(),
      })),
    },
    charts: {
      monthlyRevenue: monthlyRevenueRows.map((row) => ({
        month: row.month,
        revenue: coerceDecimal(row.revenue),
        paid: coerceDecimal(row.paid),
        pending: coerceDecimal(row.pending),
      })),
      topProducts: topProductRows.map((row) => ({
        name: row.name,
        revenue: coerceDecimal(row.revenue),
      })),
    },
    growth: {
      currentMonth: {
        invoices: invoicePeriod.currentMonthCount,
        customers: customerPeriod.currentMonth,
        products: productPeriod.currentMonth,
        revenue: currentMonthRevenue,
      },
      previousMonth: {
        invoices: invoicePeriod.previousMonthCount,
        customers: customerPeriod.previousMonth,
        products: productPeriod.previousMonth,
        revenue: previousMonthRevenue,
      },
    },
  };
}

const cachedDashboardOverview = (userId: string) =>
  unstable_cache(
    () => computeDashboardOverview(userId),
    ['dashboard-overview', userId],
    {
      revalidate: 300,
      tags: [DASHBOARD_TAG(userId)],
    },
  );

export function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  return cachedDashboardOverview(userId)();
}
