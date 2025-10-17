import type { DashboardOverview } from '@/lib/data/dashboard';
import type { CompanyDetails as CompanyRecord } from '@/lib/data/company';

export interface MonthlyDataPoint {
  month: string;
  revenue: number;
  paid: number;
  pending: number;
}

export interface TopProduct {
  name: string;
  revenue: number;
}

export interface CompanyDetails {
  legalName: string | null;
  ownerName: string | null;
  registrationNumber?: string | null;
  taxIdentificationNumber?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  address?: string | null;
  logoUrl?: string | null;
  paymentMethod?: string | null;
  bankAccountName?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  qrImageUrl?: string | null;
}

export interface DashboardStats {
  totalInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  invoiceStats: {
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    pendingAmount: number;
    outstandingAmount: number;
    recentInvoices: {
      id: string;
      invoiceNumber: string;
      customerName: string;
      amount: number;
      status: string;
      date: string;
    }[];
  };
  charts: {
    monthlyRevenue: MonthlyDataPoint[];
    topProducts: TopProduct[];
  };
  growth?: {
    lastMonthInvoices: number;
    lastMonthCustomers: number;
    lastMonthProducts: number;
    lastMonthRevenue: number;
    currentMonthInvoices: number;
    currentMonthCustomers: number;
    currentMonthProducts: number;
    currentMonthRevenue: number;
  };
}

export function mapDashboardOverviewToStats(data: DashboardOverview): DashboardStats {
  return {
    totalInvoices: data.totals.invoices ?? 0,
    totalCustomers: data.totals.customers ?? 0,
    totalProducts: data.totals.products ?? 0,
    inventoryValue: data.totals.inventoryValue ?? 0,
    invoiceStats: {
      totalAmount: data.invoiceStats.amount ?? 0,
      paidAmount: data.invoiceStats.paid ?? 0,
      overdueAmount: data.invoiceStats.overdue ?? 0,
      pendingAmount: data.invoiceStats.pending ?? 0,
      outstandingAmount: data.invoiceStats.outstanding ?? 0,
      recentInvoices: (data.invoiceStats.recent ?? []).map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.number,
        customerName: invoice.customerName,
        amount: invoice.amount,
        status: invoice.status,
        date: invoice.issuedOn,
      })),
    },
    charts: {
      monthlyRevenue: data.charts.monthlyRevenue ?? [],
      topProducts: data.charts.topProducts ?? [],
    },
    growth: data.growth
      ? {
          lastMonthInvoices: data.growth.previousMonth.invoices ?? 0,
          lastMonthCustomers: data.growth.previousMonth.customers ?? 0,
          lastMonthProducts: data.growth.previousMonth.products ?? 0,
          lastMonthRevenue: data.growth.previousMonth.revenue ?? 0,
          currentMonthInvoices: data.growth.currentMonth.invoices ?? 0,
          currentMonthCustomers: data.growth.currentMonth.customers ?? 0,
          currentMonthProducts: data.growth.currentMonth.products ?? 0,
          currentMonthRevenue: data.growth.currentMonth.revenue ?? 0,
        }
      : undefined,
  };
}

export function mapCompanyRecordToDetails(company: CompanyRecord | null): CompanyDetails | null {
  if (!company) {
    return null;
  }

  return {
    legalName: company.legalName ?? null,
    ownerName: company.ownerName ?? null,
    registrationNumber: company.registrationNumber ?? null,
    taxIdentificationNumber: company.taxIdentificationNumber ?? null,
    email: company.email ?? null,
    phoneNumber: company.phoneNumber ?? null,
    address: company.address ?? null,
    logoUrl: company.logoUrl ?? null,
    paymentMethod: company.paymentMethod ?? null,
    bankAccountName: company.bankAccountName ?? null,
    bankName: company.bankName ?? null,
    bankAccountNumber: company.bankAccountNumber ?? null,
    qrImageUrl: company.qrImageUrl ?? null,
  };
}
