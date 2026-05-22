"use client"

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BookOpen, BarChart3, List, Wallet, Receipt, ScrollText } from 'lucide-react';

const navItems = [
  { label: 'Overview', href: '/accounting', icon: BookOpen },
  { label: 'Transactions', href: '/accounting/transactions', icon: List },
  { label: 'Expenses', href: '/accounting/expenses', icon: Receipt },
  { label: 'Accounts', href: '/accounting/accounts', icon: Wallet },
  { label: 'Ledger', href: '/accounting/ledger', icon: ScrollText },
  { label: 'Reports', href: '/accounting/reports', icon: BarChart3 },
];

export default function AccountingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === '/accounting') return pathname === '/accounting';
    return pathname.startsWith(href);
  }

  return (
    <div className="space-y-4">
      <nav className="flex gap-1 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors",
              isActive(item.href)
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        ))}
      </nav>
      {children}
    </div>
  );
}
