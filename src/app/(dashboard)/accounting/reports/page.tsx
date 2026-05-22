"use client"

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { FileText, Scale, TrendingUp, Banknote } from 'lucide-react';

const reports = [
  {
    title: 'Trial Balance',
    description: 'Verify debits equal credits across all accounts',
    href: '/accounting/reports/trial-balance',
    icon: Scale,
  },
  {
    title: 'Balance Sheet (SOFP)',
    description: 'Assets, liabilities, and equity at a point in time',
    href: '/accounting/reports/balance-sheet',
    icon: FileText,
  },
  {
    title: 'Profit & Loss',
    description: 'Revenue and expenses over a period',
    href: '/accounting/reports/profit-loss',
    icon: TrendingUp,
  },
  {
    title: 'Cash Flow (SOCF)',
    description: 'Net movement in cash and bank accounts',
    href: '/accounting/reports/cash-flow',
    icon: Banknote,
  },
];

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Financial Reports</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {reports.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="rounded-xl transition-shadow hover:shadow-md cursor-pointer h-full">
              <CardContent className="flex items-start gap-3 p-4">
                <div className="rounded-lg bg-muted p-2 shrink-0">
                  <r.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-sm font-medium">{r.title}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
