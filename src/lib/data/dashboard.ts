import { Prisma, InvoiceStatus } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/decimal';

export interface DashboardOverview {
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

function coerceDecimal(value: Prisma.Decimal | number | string | null | undefined) {
  return toNumber(value ?? 0);
}

export async function getDashboardOverview(userId: string): Promise<DashboardOverview> {
  const [totals, products, invoiceTotals, invoiceGroups, recentInvoices] = await Promise.all([
    Promise.all([
      prisma.invoice.count({ where: { userId } }),
      prisma.customer.count({ where: { userId } }),
      prisma.product.count({ where: { userId } }),
    ]),
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

  const { start: currentStart, end: currentEnd } = getMonthRange(0);
  const { start: previousStart, end: previousEnd } = getMonthRange(-1);

  const [
    currentMonthInvoices,
    previousMonthInvoices,
    currentMonthCustomers,
    previousMonthCustomers,
    currentMonthProducts,
    previousMonthProducts,
  ] = await Promise.all([
    prisma.invoice.aggregate({
      where: {
        userId,
        issueDate: {
          gte: currentStart,
          lt: currentEnd,
        },
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.invoice.aggregate({
      where: {
        userId,
        issueDate: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
      _count: { _all: true },
      _sum: { total: true },
    }),
    prisma.customer.count({
      where: {
        userId,
        createdAt: {
          gte: currentStart,
          lt: currentEnd,
        },
      },
    }),
    prisma.customer.count({
      where: {
        userId,
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    }),
    prisma.product.count({
      where: {
        userId,
        createdAt: {
          gte: currentStart,
          lt: currentEnd,
        },
      },
    }),
    prisma.product.count({
      where: {
        userId,
        createdAt: {
          gte: previousStart,
          lt: previousEnd,
        },
      },
    }),
  ]);

  return {
    totals: {
      invoices: totals[0],
      customers: totals[1],
      products: totals[2],
      inventoryValue,
    },
    invoiceStats: {
      amount: coerceDecimal(invoiceTotals._sum.total),
      paid: coerceDecimal(invoiceTotals._sum.paidAmount),
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
        invoices: currentMonthInvoices._count?._all ?? 0,
        customers: currentMonthCustomers,
        products: currentMonthProducts,
        revenue: coerceDecimal(currentMonthInvoices._sum.total),
      },
      previousMonth: {
        invoices: previousMonthInvoices._count?._all ?? 0,
        customers: previousMonthCustomers,
        products: previousMonthProducts,
        revenue: coerceDecimal(previousMonthInvoices._sum.total),
      },
    },
  };
}
