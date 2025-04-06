'use client';

import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  FileText, 
  LayoutDashboard, 
  LogOut, 
  Package, 
  Settings, 
  Users,
  PlusCircle,
  LucideIcon,
  Receipt
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { ProfileNotification } from '@/components/ui/profile-notification';
import { useTheme } from 'next-themes';
import { useSettings } from '@/contexts/settings-context';

interface User {
  id: string;
  name: string;
  email: string;
}

interface CompanyDetails {
  legalName: string;
  ownerName: string;
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  logoUrl?: string;
  paymentMethod?: string;
  bankAccountName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  qrImageUrl?: string;
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  const { settings } = useSettings();

  // TEMPORARILY BYPASSING AUTHENTICATION
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (isInitialLoad) {
      // Simulate a user for testing, but only on initial load
      setUser({
        id: 'test-user',
        name: 'Test User',
        email: 'test@example.com'
      });
      
      // Fetch company details
      fetchCompanyDetails();
      
      setIsInitialLoad(false);
    }
  }, [isInitialLoad]);
  
  // Fetch company details from the API
  const fetchCompanyDetails = async () => {
    try {
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setCompanyDetails(data);
        }
      }
    } catch (error) {
      console.error('Error fetching company details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const baseNavigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Inventory', href: '/inventory', icon: Package },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];
  
  // Add Receipts menu item if enabled in settings
  const navigationItems = settings.enableReceiptsModule 
    ? [
        ...baseNavigationItems.slice(0, 2), 
        { name: 'Receipts', href: '/receipts', icon: Receipt },
        ...baseNavigationItems.slice(2)
      ]
    : baseNavigationItems;

  // Show loading state or login redirect
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <div className="relative h-8 w-8">
                <Image 
                  src={isDarkMode ? "/invo-logo-w.png" : "/invo-logo.png"} 
                  alt="Invo" 
                  width={32} 
                  height={32}
                  className="h-8 w-auto"
                />
              </div>
              <span className={`font-bold text-xl ${isDarkMode ? "text-white" : "text-primary"}`}>Invo</span>
            </Link>
          </div>

          {/* Theme toggle and user dropdown */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback>
                      {companyDetails?.ownerName 
                        ? companyDetails.ownerName.split(' ').map(n => n[0]).join('').toUpperCase()
                        : user?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="flex flex-col p-2">
                  <p className="font-medium">
                    {companyDetails?.ownerName || user?.name}
                  </p>
                  {companyDetails?.legalName && (
                    <p className="text-sm text-muted-foreground">
                      {companyDetails.legalName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {companyDetails?.email || user?.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-5 w-5" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar navigation (desktop) */}
        <aside className="hidden border-r bg-muted/40 md:block md:w-64">
          <nav className="grid gap-1 p-4">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center rounded-md px-3 py-2 text-sm hover:bg-accent ${
                    pathname === item.href ? 'bg-accent' : ''
                  }`}
                >
                  <Icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
            
            <div className="mt-6">
              <Link
                href="/invoices/new"
                className="flex w-full items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Invoice
              </Link>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto p-4 pb-20 md:p-6 md:pb-6">{children}</main>
      </div>
      
      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-10 border-t bg-background md:hidden">
        <div className="grid h-16 grid-cols-5 items-center">
          {navigationItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center space-y-1 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="text-xs">{item.name}</span>
              </Link>
            );
          })}
          
          {/* Create Invoice Button */}
          <Link
            href="/invoices/new"
            className="flex flex-col items-center justify-center space-y-1"
          >
            <PlusCircle className="h-6 w-6 text-blue-500" />
            <span className="text-xs font-medium">New</span>
          </Link>
        </div>
      </nav>

      {/* Profile notification */}
      <ProfileNotification />
    </div>
  );
}
