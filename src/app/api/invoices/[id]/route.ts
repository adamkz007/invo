import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { randomUUID } from 'crypto';
import { InvoiceStatus, Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { postInvoicePayment } from '@/lib/accounting/posting';
import { getUserFromRequest } from '@/lib/auth';
import { toDecimal, toNumber } from '@/lib/decimal';

const INVOICE_TAG = (userId: string) => `invoices:${userId}`;
const DASHBOARD_TAG = (userId: string) => `dashboard:${userId}`;
const RECEIPTS_TAG = (userId: string) => `receipts:${userId}`;

type InvoiceWithItems = Awaited<ReturnType<typeof fetchInvoice>>;

function serialiseInvoice(invoice: InvoiceWithItems) {
  return {
    id: invoice.id,
    invoiceNumber: invoice.invoiceNumber,
    status: invoice.status,
    issueDate: invoice.issueDate.toISOString(),
    dueDate: invoice.dueDate.toISOString(),
    subtotal: toNumber(invoice.subtotal),
    taxRate: toNumber(invoice.taxRate, 4),
    taxAmount: toNumber(invoice.taxAmount),
    discountRate: toNumber(invoice.discountRate, 4),
    discountAmount: toNumber(invoice.discountAmount),
    total: toNumber(invoice.total),
    paidAmount: toNumber(invoice.paidAmount),
    notes: invoice.notes,
    customer: invoice.customer,
    items: invoice.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: toNumber(item.unitPrice),
      amount: toNumber(item.unitPrice) * item.quantity,
      description: item.description,
      product: item.product
        ? {
            id: item.product.id,
            name: item.product.name,
            price: toNumber(item.product.price),
            disableStockManagement: item.product.disableStockManagement,
          }
        : null,
    })),
    createdAt: invoice.createdAt.toISOString(),
    updatedAt: invoice.updatedAt.toISOString(),
  };
}

async function fetchInvoice(userId: string, invoiceId: string, tx?: Prisma.TransactionClient) {
  const client = tx ?? prisma;
  const invoice = await client.invoice.findFirst({
    where: {
      id: invoiceId,
      userId,
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!invoice) {
    throw new Error('Invoice not found');
  }

  return invoice;
}

async function adjustStock(
  tx: Prisma.TransactionClient,
  items: InvoiceWithItems['items'],
  direction: 'increment' | 'decrement',
) {
  for (const item of items) {
    if (!item.product || item.product.disableStockManagement) {
      continue;
    }

    await tx.product.update({
      where: { id: item.productId },
      data: {
        quantity: {
          [direction]: item.quantity,
        },
      },
    });
  }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const invoice = await fetchInvoice(user.id, params.id);
    return NextResponse.json(serialiseInvoice(invoice));
  } catch (error) {
    if (error instanceof Error && error.message === 'Invoice not found') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    console.error('Failed to fetch invoice', error);
    return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { action, paymentAmount } = await req.json();

  try {
    const { updatedInvoice, receiptPayload } = await prisma.$transaction(async (tx) => {
      const invoice = await fetchInvoice(user.id, params.id, tx);
      let nextInvoice: InvoiceWithItems = invoice;
      let receiptData: Record<string, unknown> | null = null;

      if (action === 'cancel') {
        if (
          invoice.status === InvoiceStatus.PAID ||
          invoice.status === InvoiceStatus.PARTIAL ||
          invoice.status === InvoiceStatus.SENT
        ) {
          await adjustStock(tx, invoice.items, 'increment');
        }

        nextInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.CANCELLED,
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        }) as InvoiceWithItems;
      } else if (action === 'mark_sent') {
        if (invoice.status === InvoiceStatus.DRAFT) {
          await adjustStock(tx, invoice.items, 'decrement');
        }

        nextInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: InvoiceStatus.SENT,
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        }) as InvoiceWithItems;
      } else if (action === 'payment') {
        const parsedPayment = Number(paymentAmount);
        if (!paymentAmount || Number.isNaN(parsedPayment) || parsedPayment <= 0) {
          throw new Error('Invalid payment amount');
        }

        if (invoice.status === InvoiceStatus.DRAFT) {
          await adjustStock(tx, invoice.items, 'decrement');
        }

        const paymentDecimal = toDecimal(parsedPayment);
        const currentPaidDecimal = toDecimal(invoice.paidAmount ?? 0);
        const newPaidAmountDecimal = currentPaidDecimal.plus(paymentDecimal);
        const totalDecimal = toDecimal(invoice.total);
        const nextStatus =
          toNumber(newPaidAmountDecimal) >= toNumber(totalDecimal)
            ? InvoiceStatus.PAID
            : InvoiceStatus.PARTIAL;

        nextInvoice = await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            status: nextStatus,
            paidAmount: newPaidAmountDecimal,
          },
          include: {
            customer: true,
            items: {
              include: {
                product: true,
              },
            },
          },
        }) as InvoiceWithItems;

        // Post accounting journal entry for payment (Cash/AR)
        try {
          await postInvoicePayment({
            userId: user.id,
            invoiceId: invoice.id,
            amount: paymentDecimal,
            accounts: {
              arCode: '1100',
              cashCode: '1000',
              revenueCode: '4000',
            },
          });
        } catch (e) {
          console.warn('Accounting post (invoice payment) failed:', e);
        }

        if (nextStatus === InvoiceStatus.PAID) {
          receiptData = {
            receiptNumber: `RCT-${randomUUID().replace(/-/g, '').slice(0, 6).toUpperCase()}`,
            customerName: nextInvoice.customer?.name ?? 'Walk-in Customer',
            customerPhone: nextInvoice.customer?.phoneNumber ?? null,
            receiptDate: new Date().toISOString(),
            paymentMethod: 'INVOICE_PAYMENT',
            total: toNumber(nextInvoice.total),
            notes: `Payment for Invoice ${nextInvoice.invoiceNumber}`,
            items: nextInvoice.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: toNumber(item.unitPrice),
              description: item.description ?? '',
            })),
            invoiceId: nextInvoice.id,
            orderNumber: nextInvoice.invoiceNumber,
          };
        }
      } else {
        throw new Error('Invalid action');
      }

      return { updatedInvoice: nextInvoice, receiptPayload: receiptData };
    });

    revalidateTag(INVOICE_TAG(user.id));
    revalidateTag(DASHBOARD_TAG(user.id));

    if (receiptPayload) {
      try {
        await fetch(`${process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/receipts`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-receipts-module-enabled': 'true',
          },
          body: JSON.stringify(receiptPayload),
        });
        revalidateTag(RECEIPTS_TAG(user.id));
      } catch (error) {
        console.error('Failed to create receipt for paid invoice', error);
      }
    }

    return NextResponse.json(serialiseInvoice(updatedInvoice));
  } catch (error) {
    if (error instanceof Error && error.message === 'Invoice not found') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }

    if (error instanceof Error && error.message === 'Invalid payment amount') {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Failed to update invoice', error);
    return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await prisma.$transaction(async (tx) => {
      const invoice = await fetchInvoice(user.id, params.id, tx);

      if (
        invoice.status === InvoiceStatus.PAID ||
        invoice.status === InvoiceStatus.PARTIAL ||
        invoice.status === InvoiceStatus.SENT
      ) {
        await adjustStock(tx, invoice.items, 'increment');
      }

      await tx.invoiceItem.deleteMany({ where: { invoiceId: invoice.id } });
      await tx.invoice.delete({ where: { id: invoice.id } });
    });

    revalidateTag(INVOICE_TAG(user.id));
    revalidateTag(DASHBOARD_TAG(user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'Invoice not found') {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    console.error('Failed to delete invoice', error);
    return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
  }
}
