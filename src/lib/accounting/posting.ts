import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

type PostingAccounts = {
  arCode: string; // Accounts Receivable
  revenueCode: string; // Revenue
  taxLiabilityCode?: string; // Tax Liability
  cashCode?: string; // Cash/Bank
  apCode?: string; // Accounts Payable
  expenseCode?: string; // Expense
};

async function findAccountId(userId: string, code: string) {
  const acc = await prisma.account.findFirst({ where: { userId, code }, select: { id: true } });
  if (!acc) throw new Error(`Account ${code} not found`);
  return acc.id;
}

export function invoiceIssuedMemo(customerName: string) {
  return `Invoice to ${customerName} issued`;
}

function invoicePaymentMemo(invoiceNumber: string, amount: number) {
  return `Invoice ${invoiceNumber} payment (${amount.toFixed(2)})`;
}

export async function postInvoiceIssued({
  userId,
  invoiceId,
  customerName,
  total,
  taxAmount,
  accounts,
}: {
  userId: string;
  invoiceId: string;
  customerName: string;
  total: Prisma.Decimal | number;
  taxAmount: Prisma.Decimal | number;
  accounts: PostingAccounts;
}) {
  const existing = await prisma.journalEntry.findFirst({
    where: {
      userId,
      source: 'invoice',
      referenceId: invoiceId,
      memo: { endsWith: ' issued' },
    },
    select: { id: true },
  });
  if (existing) {
    return existing;
  }

  const arId = await findAccountId(userId, accounts.arCode);
  const revenueId = await findAccountId(userId, accounts.revenueCode);
  const taxLiabId = accounts.taxLiabilityCode ? await findAccountId(userId, accounts.taxLiabilityCode) : null;

  const totalNum = Number(total);
  const taxNum = Number(taxAmount || 0);
  const netRevenue = totalNum - taxNum;

  return prisma.journalEntry.create({
    data: {
      userId,
      date: new Date(),
      memo: invoiceIssuedMemo(customerName),
      source: 'invoice',
      referenceId: invoiceId,
      status: 'POSTED',
      postedAt: new Date(),
      lines: {
        create: [
          { accountId: arId, debit: new Prisma.Decimal(totalNum), credit: new Prisma.Decimal(0) },
          { accountId: revenueId, debit: new Prisma.Decimal(0), credit: new Prisma.Decimal(netRevenue) },
          ...(taxLiabId ? [{ accountId: taxLiabId, debit: new Prisma.Decimal(0), credit: new Prisma.Decimal(taxNum) }] : []),
        ],
      },
    },
  });
}

export async function postInvoicePayment({
  userId,
  paymentId,
  invoiceNumber,
  amount,
  accounts,
}: {
  userId: string;
  paymentId: string;
  invoiceNumber: string;
  amount: Prisma.Decimal | number;
  accounts: PostingAccounts;
}) {
  if (!accounts.cashCode) throw new Error('cashCode required for payment posting');

  const existing = await prisma.journalEntry.findFirst({
    where: {
      userId,
      source: 'invoice',
      referenceId: paymentId,
    },
    select: { id: true },
  });
  if (existing) {
    return existing;
  }

  const cashId = await findAccountId(userId, accounts.cashCode);
  const arId = await findAccountId(userId, accounts.arCode);

  const amt = Number(amount);
  return prisma.journalEntry.create({
    data: {
      userId,
      date: new Date(),
      memo: invoicePaymentMemo(invoiceNumber, amt),
      source: 'invoice',
      referenceId: paymentId,
      status: 'POSTED',
      postedAt: new Date(),
      lines: {
        create: [
          { accountId: cashId, debit: new Prisma.Decimal(amt), credit: new Prisma.Decimal(0) },
          { accountId: arId, debit: new Prisma.Decimal(0), credit: new Prisma.Decimal(amt) },
        ],
      },
    },
  });
}

export async function postExpense({
  userId,
  expenseId,
  total,
  taxAmount,
  method,
  accounts,
}: {
  userId: string;
  expenseId: string;
  total: Prisma.Decimal | number;
  taxAmount: Prisma.Decimal | number;
  method: 'CASH' | 'AP';
  accounts: PostingAccounts;
}) {
  const expenseIdAcc = await findAccountId(userId, accounts.expenseCode || '5000');
  const taxLiabId = accounts.taxLiabilityCode ? await findAccountId(userId, accounts.taxLiabilityCode) : null;
  const totalNum = Number(total);
  const taxNum = Number(taxAmount || 0);
  const netExpense = totalNum - taxNum;

  let creditAccountId: string | null = null;
  if (method === 'CASH') {
    if (!accounts.cashCode) throw new Error('cashCode required for cash expense');
    creditAccountId = await findAccountId(userId, accounts.cashCode);
  } else {
    const apCode = accounts.apCode || '2000';
    creditAccountId = await findAccountId(userId, apCode);
  }

  return prisma.journalEntry.create({
    data: {
      userId,
      date: new Date(),
      memo: `Expense ${expenseId} recorded`,
      source: 'expense',
      referenceId: expenseId,
      status: 'POSTED',
      postedAt: new Date(),
      lines: {
        create: [
          { accountId: expenseIdAcc, debit: new Prisma.Decimal(netExpense), credit: new Prisma.Decimal(0) },
          ...(taxLiabId ? [{ accountId: taxLiabId, debit: new Prisma.Decimal(taxNum), credit: new Prisma.Decimal(0) }] : []),
          { accountId: creditAccountId!, debit: new Prisma.Decimal(0), credit: new Prisma.Decimal(totalNum) },
        ],
      },
    },
  });
}
