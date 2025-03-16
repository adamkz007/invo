'use client';

import { useEffect, useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Package, ArrowUpRight, DollarSign, ClipboardList, TrendingUp, BarChart3, Download } from 'lucide-react';
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
  };
  charts: {
    monthlyRevenue: MonthlyDataPoint[];
    topProducts: TopProduct[];
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
  const growthData = useMemo(() => ({
    invoiceGrowth: "+5%",
    customerGrowth: "+12%",
    productGrowth: "+8%",
    revenueGrowth: "+15%"
  }), []);

  // Handle invoice selection
  const handleViewInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invoice details');
      }
      
      const invoiceData = await response.json();
      setSelectedInvoice(invoiceData);
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
    downloadInvoicePDF(invoice, companyDetails);
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
      
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.invoiceGrowth} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.customerGrowth} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalProducts}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.productGrowth} from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.invoiceStats.totalAmount || 0, settings)}</div>
            <p className="text-xs text-muted-foreground">
              {growthData.revenueGrowth} from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="recent">Recent Invoices</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Invoice Status
                </CardTitle>
                <ClipboardList className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-green-500"></div>
                      <span>Paid</span>
                    </div>
                    <span className="font-medium">{formatCurrency(stats?.invoiceStats.paidAmount || 0, settings)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-amber-500"></div>
                      <span>Pending</span>
                    </div>
                    <span className="font-medium">
                      {formatCurrency(stats?.invoiceStats.pendingAmount || 0, settings)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="mr-2 h-3 w-3 rounded-full bg-red-500"></div>
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
            
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common tasks to get you started
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2">
                <a 
                  href="/invoices/new" 
                  className="inline-flex items-center rounded border p-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <FileText className="mr-2 h-5 w-5" />
                  Create New Invoice
                </a>
                <a 
                  href="/customers/new" 
                  className="inline-flex items-center rounded border p-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Users className="mr-2 h-5 w-5" />
                  Add New Customer
                </a>
                <a 
                  href="/inventory/new" 
                  className="inline-flex items-center rounded border p-2 text-sm font-medium transition-colors hover:bg-accent"
                >
                  <Package className="mr-2 h-5 w-5" />
                  Add New Product
                </a>
              </CardContent>
            </Card>
            
            <Card className="sm:col-span-2 lg:col-span-1">
              <CardHeader>
                <CardTitle>Business Summary</CardTitle>
                <CardDescription>
                  Your financial overview
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Revenue</span>
                  <span className="text-sm">{formatCurrency(stats?.invoiceStats.totalAmount || 0, settings)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Outstanding</span>
                  <span className="text-sm">
                    {formatCurrency(
                      (stats?.invoiceStats.totalAmount || 0) - (stats?.invoiceStats.paidAmount || 0),
                      settings
                    )}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Payment Rate</span>
                  <span className="text-sm">
                    {Math.round(((stats?.invoiceStats.paidAmount || 0) / (stats?.invoiceStats.totalAmount || 1)) * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Inventory Value</span>
                  <span className="text-sm">{formatCurrency(stats?.inventoryValue || 0, settings)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Invoices</span>
                  <span className="text-sm">{stats?.totalInvoices || 0}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>
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
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                              <YAxis tickFormatter={(value) => formatCurrency(value, settings)} tick={{ fontSize: 10 }} />
                              <Tooltip 
                                formatter={(value) => formatCurrency(value as number, settings)}
                                labelFormatter={(label) => `Month: ${label}`}
                              />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Bar dataKey="paid" name="Paid" fill="#10b981" />
                              <Bar dataKey="pending" name="Pending" stackId="a" fill="#f59e0b" />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </ChartComponents>
                    )}
                  </Suspense>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Products by Revenue</CardTitle>
                <CardDescription>
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
                            <PieChart>
                              <Pie
                                data={stats.charts.topProducts}
                                cx="50%"
                                cy="50%"
                                innerRadius={40}
                                outerRadius={70}
                                fill="#8884d8"
                                dataKey="revenue"
                                nameKey="name"
                                label={({ name, percent }) => {
                                  const shortName = name.length > 10 ? `${name.substring(0, 10)}...` : name;
                                  return <text x={0} y={0} fill="#333" fontSize={11} fontWeight="bold" textAnchor="middle" dominantBaseline="central">
                                    {`${(percent * 100).toFixed(0)}%`}
                                  </text>;
                                }}
                              >
                                {stats.charts.topProducts.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                  <tspan x="50%" dy="-0.5em" fontSize="12" textAnchor="middle" fill="#666">
                                    Total
                                  </tspan>
                                  <tspan x="50%" dy="1.2em" fontSize="14" fontWeight="bold" textAnchor="middle" fill="#333">
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
                              />
                              <Legend 
                                wrapperStyle={{ fontSize: 12, paddingTop: 10 }}
                                iconSize={12}
                                iconType="circle"
                                layout="horizontal"
                                verticalAlign="bottom"
                                align="center"
                                margin={{ top: 10, bottom: 0, left: 0, right: 0 }}
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
            
            <Card className="col-span-1 sm:col-span-2">
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>
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
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                              <YAxis tickFormatter={(value) => formatCurrency(value, settings)} tick={{ fontSize: 10 }} />
                              <Tooltip 
                                formatter={(value) => formatCurrency(value as number, settings)}
                                labelFormatter={(label) => `Month: ${label}`}
                              />
                              <Legend wrapperStyle={{ fontSize: 10 }} />
                              <Line 
                                type="monotone" 
                                dataKey="revenue" 
                                name="Total Revenue" 
                                stroke="#8884d8" 
                                activeDot={{ r: 8 }} 
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
          <Card>
            <CardHeader>
              <CardTitle>Recent Invoices</CardTitle>
              <CardDescription>
                Your latest invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats?.invoiceStats.recentInvoices.length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-muted-foreground">No invoices found</p>
                  </div>
                ) : (
                  stats?.invoiceStats.recentInvoices.map((invoice) => (
                    <div 
                      key={invoice.id} 
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewInvoice(invoice.id)}
                    >
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{invoice.invoiceNumber}</p>
                        <p className="text-base font-bold">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">Date: {invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(invoice.amount, settings)}</p>
                        <div className="mt-1">
                          {getStatusBadge(invoice.status, true)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <a 
                  href="/invoices" 
                  className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                >
                  View all invoices
                  <ArrowUpRight className="ml-1 h-5 w-5" />
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Invoice Details Dialog */}
      <Dialog open={selectedInvoice !== null} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-xl w-full mx-auto p-6 space-y-6">
          <DialogTitle className="sr-only">Invoice Details</DialogTitle>
          {selectedInvoice && (
            <>
              <div className="grid grid-cols-2 gap-4">
                {/* Company Header */}
                <div>
                  <h2 className="text-2xl font-bold text-primary">
                    {companyDetails?.legalName || 'Invo Solutions'}
                  </h2>
                  {companyDetails?.address && (
                    <p className="text-sm text-muted-foreground">{companyDetails.address}</p>
                  )}
                  {companyDetails?.email && (
                    <p className="text-sm text-muted-foreground">{companyDetails.email}</p>
                  )}
                  {companyDetails?.phoneNumber && (
                    <p className="text-sm text-muted-foreground">{companyDetails.phoneNumber}</p>
                  )}
                  {!companyDetails && (
                    <>
                      <p className="text-sm text-muted-foreground">123 Business Street</p>
                      <p className="text-sm text-muted-foreground">Silicon Valley, CA 94000</p>
                      <p className="text-sm text-muted-foreground">contact@invo.com</p>
                    </>
                  )}
                </div>

                {/* Invoice Details */}
                <div className="text-right">
                  <h1 className="text-3xl font-extrabold">INVOICE</h1>
                  <p className="text-sm mt-2">
                    <span className="font-semibold">Invoice #:</span> {selectedInvoice.invoiceNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Issue Date:</span> {format(new Date(selectedInvoice.issueDate), 'PP')}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">Due Date:</span> {format(new Date(selectedInvoice.dueDate), 'PP')}
                  </p>
                  <div className="flex justify-end mt-2">
                    <span className="font-semibold mr-2">Status:</span>
                    {getStatusBadge(selectedInvoice.status, true)}
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="border-t border-b py-4 my-4">
                <h3 className="text-lg font-semibold mb-2">Bill To</h3>
                <p className="font-bold">{selectedInvoice.customer.name}</p>
                {selectedInvoice.customer.email && (
                  <p className="text-muted-foreground">{selectedInvoice.customer.email}</p>
                )}
                {selectedInvoice.customer.phoneNumber && (
                  <p className="text-muted-foreground">{selectedInvoice.customer.phoneNumber}</p>
                )}
              </div>

              {/* Invoice Items */}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedInvoice.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div>{item.product.name}</div>
                        {item.product.description && (
                          <div className="text-xs text-muted-foreground">{item.product.description}</div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">{item.quantity}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.unitPrice, settings)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.quantity * item.unitPrice, settings)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Totals */}
              <div className="ml-auto max-w-xs w-full space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatCurrency(selectedInvoice.subtotal, settings)}</span>
                </div>
                {selectedInvoice.taxRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tax ({selectedInvoice.taxRate}%)</span>
                    <span>{formatCurrency(selectedInvoice.taxAmount, settings)}</span>
                  </div>
                )}
                {selectedInvoice.discountRate > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Discount ({selectedInvoice.discountRate}%)</span>
                    <span>-{formatCurrency(selectedInvoice.discountAmount, settings)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-2 mt-1 border-t">
                  <span>Total</span>
                  <span>{formatCurrency(selectedInvoice.total, settings)}</span>
                </div>
                {(selectedInvoice.status === 'PAID' || selectedInvoice.status === 'PARTIAL') && selectedInvoice.paidAmount && (
                  <div className="flex justify-between text-sm pt-2 text-green-600">
                    <span>Paid</span>
                    <span>{formatCurrency(selectedInvoice.paidAmount, settings)}</span>
                  </div>
                )}
                {selectedInvoice.status === 'PARTIAL' && selectedInvoice.paidAmount && (
                  <div className="flex justify-between text-sm text-amber-600 font-medium">
                    <span>Amount Due</span>
                    <span>{formatCurrency(selectedInvoice.total - selectedInvoice.paidAmount, settings)}</span>
                  </div>
                )}
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
