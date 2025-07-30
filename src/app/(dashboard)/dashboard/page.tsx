'use client';

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Package, ArrowUpRight, DollarSign, ClipboardList, TrendingUp, BarChart3, Download, Calendar } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';
import type { ComponentType } from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { downloadInvoicePDF } from '@/lib/pdf-generator';
import { InvoiceWithDetails } from '@/types';
import Image from 'next/image';
import { useTheme } from 'next-themes';

// Import types for proper typing
import type { 
  BarChart as BarChartType,
  Bar as BarType,
  XAxis as XAxisType,
  YAxis as YAxisType,
  CartesianGrid as CartesianGridType,
  Tooltip as TooltipType,
  Legend as LegendType,
  ResponsiveContainer as ResponsiveContainerType,
  LineChart as LineChartType,
  Line as LineType,
  PieChart as PieChartType,
  Pie as PieType,
  Cell as CellType
} from 'recharts';

// Define the type for the chart components
interface ChartComponentsType {
  BarChart: typeof BarChartType;
  Bar: typeof BarType;
  XAxis: typeof XAxisType;
  YAxis: typeof YAxisType;
  CartesianGrid: typeof CartesianGridType;
  Tooltip: typeof TooltipType;
  Legend: typeof LegendType;
  ResponsiveContainer: typeof ResponsiveContainerType;
  LineChart: typeof LineChartType;
  Line: typeof LineType;
  PieChart: typeof PieChartType;
  Pie: typeof PieType;
  Cell: typeof CellType;
}

// Lazy load chart components to reduce initial bundle size
const ChartComponents = lazy<ComponentType<{ children: (components: ChartComponentsType) => React.ReactNode }>>(() => 
  import('recharts').then(module => ({
    default: ({ children }: { children: (components: ChartComponentsType) => React.ReactNode }) => 
      children({
        BarChart: module.BarChart,
        Bar: module.Bar,
        XAxis: module.XAxis,
        YAxis: module.YAxis,
        CartesianGrid: module.CartesianGrid,
        Tooltip: module.Tooltip,
        Legend: module.Legend,
        ResponsiveContainer: module.ResponsiveContainer,
        LineChart: module.LineChart,
        Line: module.Line,
        PieChart: module.PieChart,
        Pie: module.Pie,
        Cell: module.Cell
      })
  }))
);

// Loading fallback for charts
const ChartLoading = () => (
  <div className="flex h-80 items-center justify-center">
    <div className="text-center">
      <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
      <p>Loading charts...</p>
    </div>
  </div>
);

interface MonthlyDataPoint {
  month: string;
  revenue: number;
  paid: number;
  pending: number;
}

interface TopProduct {
  name: string;
  revenue: number;
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

interface DashboardStats {
  totalInvoices: number;
  totalCustomers: number;
  totalProducts: number;
  inventoryValue: number;
  invoiceStats: {
    totalAmount: number;
    paidAmount: number;
    overdueAmount: number;
    pendingAmount: number;
    recentInvoices: {
      id: string;
      invoiceNumber: string;
      customerName: string;
      amount: number;
      status: string;
      date: string;
    }[];
    outstandingAmount: number;
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

// Helper function to get status badge styling
const getStatusBadge = (status: string, isCompact: boolean = false) => {
  const baseClasses = isCompact 
    ? "px-1.5 py-0.5 text-xs" 
    : "px-2 py-1";
    
  switch (status) {
    case 'PAID':
      return <div className={`bg-green-100 text-green-800 rounded-full ${baseClasses}`}>Paid</div>;
    case 'PARTIAL':
      return <div className={`bg-amber-100 text-amber-800 rounded-full ${baseClasses}`}>Partial</div>;
    case 'OVERDUE':
      return <div className={`bg-red-100 text-red-800 rounded-full ${baseClasses}`}>Overdue</div>;
    case 'SENT':
      return <div className={`bg-blue-100 text-blue-800 rounded-full ${baseClasses}`}>Sent</div>;
    case 'DRAFT':
      return <div className={`bg-gray-100 text-gray-800 rounded-full ${baseClasses}`}>Draft</div>;
    case 'CANCELLED':
      return <div className={`bg-gray-100 text-gray-500 rounded-full ${baseClasses}`}>Cancelled</div>;
    default:
      return <div className={`bg-gray-100 text-gray-800 rounded-full ${baseClasses}`}>{status}</div>;
  }
};

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceWithDetails | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(null);
  const { showToast } = useToast();
  const { settings } = useSettings();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';

  // Use useCallback to prevent recreation of this function on each render
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard', {
        cache: 'no-store',
        next: { revalidate: 0 }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast({
        message: 'Failed to load dashboard data. Please try again.',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);
  
  // Fetch company details
  useEffect(() => {
    async function fetchCompanyDetails() {
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
      }
    }
    
    fetchCompanyDetails();
  }, []);
  
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Memoize growth percentages to prevent recalculation on each render
  const growthData = useMemo(() => {
    // Helper function to calculate percentage increase
    const calculatePercentageIncrease = (current: number, previous: number): string => {
      try {
        if (previous === 0) {
          return current > 0 ? "+100%" : "N/A";
        }
        
        const percentageChange = ((current - previous) / previous) * 100;
        
        if (isNaN(percentageChange) || !isFinite(percentageChange)) {
          return "N/A";
        }
        
        const sign = percentageChange >= 0 ? "+" : "";
        return `${sign}${percentageChange.toFixed(1)}%`;
      } catch (error) {
        return "N/A";
      }
    };
    
    // If we have growth data from the API, use it to calculate percentages
    if (stats?.growth) {
      const { 
        lastMonthInvoices, lastMonthCustomers, lastMonthProducts, lastMonthRevenue,
        currentMonthInvoices, currentMonthCustomers, currentMonthProducts, currentMonthRevenue
      } = stats.growth;
      
      // Use total invoices/customers/products for calculating percentage if data is available
      const totalInvoicesIncrease = calculatePercentageIncrease(
        (stats?.totalInvoices || 0) - lastMonthInvoices,
        lastMonthInvoices
      );
      
      const totalCustomersIncrease = calculatePercentageIncrease(
        (stats?.totalCustomers || 0) - lastMonthCustomers,
        lastMonthCustomers
      );
      
      const totalProductsIncrease = calculatePercentageIncrease(
        (stats?.totalProducts || 0) - lastMonthProducts,
        lastMonthProducts
      );
      
      const revenueIncrease = calculatePercentageIncrease(
        currentMonthRevenue,
        lastMonthRevenue
      );
      
      return {
        invoiceGrowth: totalInvoicesIncrease,
        customerGrowth: totalCustomersIncrease,
        productGrowth: totalProductsIncrease,
        revenueGrowth: revenueIncrease
      };
    }
    
    // Fallback to default values if growth data is not available
    return {
      invoiceGrowth: "N/A",
      customerGrowth: "N/A",
      productGrowth: "N/A",
      revenueGrowth: "N/A"
    };
  }, [stats]);

  // Handle invoice selection
  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const invoiceData = await response.json();
      
      // Check if invoice has items before setting it
      if (!invoiceData.items || invoiceData.items.length === 0) {
        // Fetch complete data if items are missing
        console.warn('Invoice data is missing items, attempting to fetch complete data');
        
        const retryResponse = await fetch(`/api/invoices/${invoiceId}`);
        if (retryResponse.ok) {
          const completeData = await retryResponse.json();
          setSelectedInvoice(completeData);
        } else {
          // If retry fails, show with empty items
          setSelectedInvoice(invoiceData);
          showToast({
            message: 'Invoice details may be incomplete',
            variant: 'warning',
          });
        }
      } else {
        // Set the invoice data if items are present
        setSelectedInvoice(invoiceData);
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error);
      showToast({
        message: 'Failed to load invoice details',
        variant: 'error',
      });
    }
  };

  // Handle PDF download
  const handleDownloadPDF = (invoice: InvoiceWithDetails) => {
    // Fetch complete invoice details with items before generating PDF
    fetch(`/api/invoices/${invoice.id}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch complete invoice details for PDF');
        }
        return response.json();
      })
      .then(completeInvoice => {
        // Pass complete invoice data with items to the PDF generator
        downloadInvoicePDF(completeInvoice, companyDetails);
      })
      .catch(error => {
        console.error('Error fetching invoice for PDF:', error);
        showToast({
          message: 'Could not generate PDF with complete data',
          variant: 'error',
        });
        // Fall back to using the original invoice data
        downloadInvoicePDF(invoice, companyDetails);
      });
  };

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-100px)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4 animate-in fade-in duration-500">
        <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <div className="rounded-full p-2 bg-primary/10 dark:bg-primary/20 shadow-sm">
              <FileText className="h-5 w-5 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.invoiceGrowth} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <div className="rounded-full p-2 bg-accent/10 dark:bg-accent/20 shadow-sm">
              <Users className="h-5 w-5 text-accent dark:text-accent-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.customerGrowth} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <div className="rounded-full p-2 bg-secondary/10 dark:bg-secondary/20 shadow-sm">
              <Package className="h-5 w-5 text-secondary-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.productGrowth} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <div className="rounded-full p-2 bg-green-500/10 dark:bg-green-500/20 shadow-sm">
              <DollarSign className="h-5 w-5 text-green-500 dark:text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.invoiceStats.totalAmount || 0, settings)}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.revenueGrowth} from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="grid w-full grid-cols-3 p-1 bg-muted/50 rounded-xl shadow-sm">
            <TabsTrigger value="overview" className="transition-all duration-300">Overview</TabsTrigger>
<TabsTrigger value="charts" className="transition-all duration-300">Charts</TabsTrigger>
<TabsTrigger value="recent" className="transition-all duration-300">Recent Invoices</TabsTrigger>
          </TabsList>
        
        <TabsContent value="overview" className="space-y-6 animate-in fade-in duration-500">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Invoice Status
                </CardTitle>
                <div className="rounded-full p-2 bg-muted/50 dark:bg-muted/30 shadow-sm">
                  <ClipboardList className="h-5 w-5 text-muted-foreground dark:text-muted-foreground/80" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm dark:text-foreground/90 hover:bg-green-50 dark:hover:bg-green-900/10 p-1 rounded-md transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-green-500 dark:bg-green-400 dark:ring-1 dark:ring-green-400/30 shadow-sm"></div>
                      <span>Paid</span>
                    </div>
                    <span className="font-medium">{formatCurrency(stats?.invoiceStats.paidAmount || 0, settings)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm dark:text-foreground/90 hover:bg-amber-50 dark:hover:bg-amber-900/10 p-1 rounded-md transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-amber-500 dark:bg-amber-400 dark:ring-1 dark:ring-amber-400/30 shadow-sm"></div>
                      <span>Pending</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(stats?.invoiceStats.pendingAmount || 0, settings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm dark:text-foreground/90 hover:bg-red-50 dark:hover:bg-red-900/10 p-1 rounded-md transition-colors duration-200">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-red-500 dark:bg-red-400 dark:ring-1 dark:ring-red-400/30 shadow-sm"></div>
                      <span>Overdue</span>
                    </div>
                    <span className="font-medium">{formatCurrency(stats?.invoiceStats.overdueAmount || 0, settings)}</span>
                  </div>
                </div>
                
                {/* Add a small pie chart */}
                <div className="mt-4 h-32">
                  <Suspense fallback={<ChartLoading />}>
                    {stats?.invoiceStats.recentInvoices && (
                      <ChartComponents>
                        {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend }) => (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: 'Paid', value: stats?.invoiceStats.paidAmount || 0 },
                                  { name: 'Pending', value: stats?.invoiceStats.pendingAmount || 0 },
                                  { name: 'Overdue', value: stats?.invoiceStats.overdueAmount || 0 }
                                ]}
                                cx="50%"
                                cy="50%"
                                innerRadius={30}
                                outerRadius={50}
                                paddingAngle={5}
                                dataKey="value"
                              >
                                <Cell fill="#10b981" />
                                <Cell fill="#f59e0b" />
                                <Cell fill="#ef4444" />
                              </Pie>
                              <Tooltip formatter={(value) => formatCurrency(value as number, settings)} />
                              <Legend wrapperStyle={{ fontSize: 9 }} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </ChartComponents>
                    )}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription className="dark:text-muted-foreground/80">
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <a 
                  href="/invoices/new" 
                  className="inline-flex items-center rounded border p-2 text-sm font-medium transition-colors hover:bg-primary/10 dark:border-border/60 dark:hover:bg-primary/20 dark:hover:border-primary/30 group"
                >
                  <FileText className="mr-2 h-5 w-5 text-primary dark:text-primary/80 group-hover:scale-110 transition-transform duration-200" />
                  Create New Invoice
                </a>
                <a 
                  href="/customers/new" 
                  className="inline-flex items-center rounded border p-2 text-sm font-medium transition-colors hover:bg-accent/10 dark:border-border/60 dark:hover:bg-accent/20 dark:hover:border-accent/30 group"
                >
                  <Users className="mr-2 h-5 w-5 text-accent dark:text-accent/80 group-hover:scale-110 transition-transform duration-200" />
                  Add New Customer
                </a>
                <a 
                  href="/inventory/new" 
                  className="inline-flex items-center rounded border p-2 text-sm font-medium transition-colors hover:bg-secondary/10 dark:border-border/60 dark:hover:bg-secondary/20 dark:hover:border-secondary/30 group"
                >
                  <Package className="mr-2 h-5 w-5 text-secondary dark:text-secondary/80 group-hover:scale-110 transition-transform duration-200" />
                  Add New Product
                </a>
              </CardContent>
            </Card>
            
            <Card className="sm:col-span-2 lg:col-span-1 dark:bg-gradient-to-br dark:from-card dark:to-card/95">
              <CardHeader>
                <CardTitle>Business Summary</CardTitle>
                <CardDescription className="dark:text-muted-foreground/80">
                  Your financial overview
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between dark:text-foreground/90">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-sm">{formatCurrency(stats?.invoiceStats.totalAmount || 0, settings)}</span>
                </div>
                <div className="flex items-center justify-between dark:text-foreground/90">
                  <span className="text-sm font-medium">Total Outstanding</span>
                  <span className="text-sm">
                    {formatCurrency(
                      stats?.invoiceStats.outstandingAmount || 0,
                      settings
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between dark:text-foreground/90">
                  <span className="text-sm font-medium">Payment Rate</span>
                  <span className="text-sm">
                    {Math.round(((stats?.invoiceStats.paidAmount || 0) / (stats?.invoiceStats.totalAmount || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between dark:text-foreground/90">
                  <span className="text-sm font-medium">Inventory Value</span>
                  <span className="text-sm">{formatCurrency(stats?.inventoryValue || 0, settings)}</span>
                </div>
                <div className="flex items-center justify-between dark:text-foreground/90">
                  <span className="text-sm font-medium">Active Invoices</span>
                  <span className="text-sm">{stats?.totalInvoices || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95">
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription className="dark:text-muted-foreground/80">
                  Revenue trends over the last 6 months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Suspense fallback={<ChartLoading />}>
                    {stats?.charts.monthlyRevenue && (
                      <ChartComponents>
                        {({ ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar }) => (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={stats.charts.monthlyRevenue}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} className="dark:text-foreground/70" />
                              <YAxis tickFormatter={(value) => formatCurrency(value, settings)} tick={{ fontSize: 10 }} className="dark:text-foreground/70" />
                              <Tooltip 
                                formatter={(value) => formatCurrency(value as number, settings)}
                                labelFormatter={(label) => `Month: ${label}`}
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                              />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="paid" name="Paid" fill="#10b981" className="dark:fill-green-400" />
                              <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" className="dark:fill-amber-400" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </ChartComponents>
                    )}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95">
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
                <CardDescription className="dark:text-muted-foreground/80">
                  Your best-selling products
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Suspense fallback={<ChartLoading />}>
                    {stats?.charts.topProducts && (
                      <ChartComponents>
                        {({ ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend }) => (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart margin={{ top: 20, right: 30, left: 30, bottom: 5 }}>
                              <Pie
                                data={stats.charts.topProducts}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                fill="#8884d8"
                                dataKey="revenue"
                                nameKey="name"
                                label={({ name, percent }) => {
                                  const shortName = name.length > 12 ? `${name.substring(0, 12)}...` : name;
                                  return `${shortName} (${(percent * 100).toFixed(0)}%)`;
                                }}
                                labelLine={true}
                                className="dark:text-foreground/90"
                              >
                                {stats.charts.topProducts.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="dark:opacity-90" />
                                ))}
                              </Pie>
                              {/* Add center label for total revenue */}
                              {stats.charts.topProducts && stats.charts.topProducts.length > 0 && (
                                <text 
                                  x="50%" 
                                  y="50%" 
                                  textAnchor="middle" 
                                  dominantBaseline="middle"
                                  className="fill-current"
                                >
                                  <tspan x="50%" dy="-0.5em" fontSize="12" textAnchor="middle" className="dark:fill-muted-foreground">
                                    Total
                                  </tspan>
                                  <tspan x="50%" dy="1.2em" fontSize="16" fontWeight="bold" textAnchor="middle" className="dark:fill-foreground">
                                    {formatCurrency(
                                      stats.charts.topProducts.reduce((sum, product) => sum + product.revenue, 0),
                                      settings
                                    )}
                                  </tspan>
                                </text>
                              )}
                              <Tooltip 
                                formatter={(value) => formatCurrency(value as number, settings)}
                                labelFormatter={(name) => `Product: ${name}`}
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: 11, paddingTop: 20 }}
                                iconSize={10}
                                iconType="circle"
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </ChartComponents>
                    )}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
            
            <Card className="col-span-1 sm:col-span-2 dark:bg-gradient-to-br dark:from-card dark:to-card/95">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription className="dark:text-muted-foreground/80">
                  Monthly revenue over time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <Suspense fallback={<ChartLoading />}>
                    {stats?.charts.monthlyRevenue && (
                      <ChartComponents>
                        {({ ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Line }) => (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart
                              data={stats.charts.monthlyRevenue}
                              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" className="dark:opacity-30" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} className="dark:text-foreground/70" />
                              <YAxis tickFormatter={(value) => formatCurrency(value, settings)} tick={{ fontSize: 10 }} className="dark:text-foreground/70" />
                              <Tooltip 
                                formatter={(value) => formatCurrency(value as number, settings)}
                                labelFormatter={(label) => `Month: ${label}`}
                                contentStyle={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '8px' }}
                              />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                name="Total Revenue" 
                                stroke="#8884d8" 
                                className="dark:stroke-primary"
                                activeDot={{ r: 8, className: "dark:fill-primary dark:stroke-primary-foreground" }} 
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </ChartComponents>
                    )}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="recent">
          <Card className="dark:bg-gradient-to-br dark:from-card dark:to-card/95 hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription className="dark:text-muted-foreground/80">
                Your latest invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {!stats?.invoiceStats?.recentInvoices || stats.invoiceStats.recentInvoices.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground dark:text-muted-foreground/80">No invoices found</p>
                  </div>
                ) : (
                  stats.invoiceStats.recentInvoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 dark:border-border/60 dark:hover:bg-accent/10 transition-all duration-200 hover:shadow-sm hover:scale-[1.01]"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground dark:text-muted-foreground/80">{invoice.invoiceNumber}</p>
                        <p className="text-base font-bold dark:text-foreground/90">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground dark:text-muted-foreground/70">Date: {invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium dark:text-foreground/90">{formatCurrency(invoice.amount, settings)}</p>
                        <div className="mt-1 transition-transform duration-200 group-hover:scale-105">
                          {getStatusBadge(invoice.status, true)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <a 
                  href="/invoices" 
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline dark:text-primary/90 dark:hover:text-primary group transition-all duration-200"
                >
                  View all invoices
                  <ArrowUpRight className="ml-1 h-5 w-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Dialog */}
      <Dialog open={selectedInvoice !== null} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-xl w-full mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto max-h-[90vh] sm:max-h-[85vh] dark:bg-gradient-to-br dark:from-card dark:to-card/95">
          <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          {selectedInvoice && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Customer Information */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-muted-foreground dark:text-muted-foreground/80">Bill To:</h3>
                  <p className="font-medium dark:text-foreground/90">{selectedInvoice.customer.name}</p>
                  {selectedInvoice.customer.email && (
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">{selectedInvoice.customer.email}</p>
                  )}
                  {selectedInvoice.customer.phoneNumber && (
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground/80">{selectedInvoice.customer.phoneNumber}</p>
                  )}
                  {selectedInvoice.customer.address && (
                    <p className="text-sm text-muted-foreground dark:text-muted-foreground/80 whitespace-pre-line">{selectedInvoice.customer.address}</p>
                  )}
                </div>
                
                {/* Invoice Information */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold dark:text-foreground">Invoice #{selectedInvoice.invoiceNumber}</h2>
                    {getStatusBadge(selectedInvoice.status)}
                  </div>
                  <div className="flex flex-col gap-1 text-sm dark:text-foreground/90">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground dark:text-muted-foreground/80" />
                      <span>Issued: {format(new Date(selectedInvoice.issueDate), 'MMMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Due: {format(new Date(selectedInvoice.dueDate), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Information */}
              <div className="mt-4 p-3 bg-muted/50 rounded-md">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold">From:</h3>
                  <span className="font-medium">{companyDetails?.legalName || 'Your Company'}</span>
                </div>
                {companyDetails?.email && (
                  <p className="text-xs text-muted-foreground">{companyDetails.email}</p>
                )}
                {companyDetails?.phoneNumber && (
                  <p className="text-xs text-muted-foreground">{companyDetails.phoneNumber}</p>
                )}
                {companyDetails?.address && (
                  <p className="text-xs text-muted-foreground">{companyDetails.address}</p>
                )}
              </div>

              {/* Invoice Items */}
              <div className="border rounded-md overflow-hidden">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Item</TableHead>
                        <TableHead className="text-right">Qty</TableHead>
                        <TableHead className="text-right">Price</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedInvoice?.items?.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium">
                            {item.product.name}
                            {item.description && (
                              <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-bold">{item.quantity}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(item.unitPrice, settings)}</TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(item.quantity * item.unitPrice, settings)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Totals */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(selectedInvoice.subtotal || 0, settings)}</span>
                </div>
                
                {selectedInvoice.taxRate > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Tax ({selectedInvoice.taxRate}%):</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount || 0, settings)}</span>
                  </div>
                )}
                
                {selectedInvoice.discountRate > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span>Discount ({selectedInvoice.discountRate}%):</span>
                    <span>-{formatCurrency(selectedInvoice.discountAmount || 0, settings)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span>{formatCurrency(selectedInvoice.total || 0, settings)}</span>
                </div>
                
                {selectedInvoice.paidAmount && selectedInvoice.paidAmount > 0 && (
                  <>
                    <div className="flex justify-between items-center text-sm text-green-600">
                      <span>Paid:</span>
                      <span>{formatCurrency(selectedInvoice.paidAmount, settings)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center font-bold">
                      <span>Balance Due:</span>
                      <span>{formatCurrency(selectedInvoice.total - selectedInvoice.paidAmount, settings)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div className="text-center text-sm text-muted-foreground mt-4">
                <p>Thank you for your business!</p>
                <div className="flex items-center justify-center mt-2">
                  <span>Powered by</span>
                  <div className="flex items-center ml-1">
                    <Image src={isDarkMode ? "/invo-logo-w.png" : "/invo-logo.png"} alt="Invo Logo" className="h-4 w-4 mr-1" width={16} height={16} />
                    <span className="text-xs font-medium">Invo</span>
                  </div>
                </div>
              </div>
              
              {/* Download PDF Button */}
              <div className="flex justify-center mt-6">
                <Button 
                  onClick={() => handleDownloadPDF(selectedInvoice)}
                  className="flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
