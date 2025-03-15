'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Users, Package, ArrowUpRight, DollarSign, ClipboardList, TrendingUp, BarChart3 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { useToast } from '@/components/ui/toast';
import { useSettings } from '@/contexts/settings-context';

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

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();
  const { settings } = useSettings();

  useEffect(() => {
    async function fetchDashboardData() {
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
    }
    
    fetchDashboardData();
  }, [showToast]);

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

  // Calculate growth percentages (mock data for now)
  const invoiceGrowth = "+5%";
  const customerGrowth = "+12%";
  const productGrowth = "+8%";
  const revenueGrowth = "+15%";

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
              {invoiceGrowth} from last month
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
              {customerGrowth} from last month
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
              {productGrowth} from last month
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
              {revenueGrowth} from last month
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
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats?.charts.monthlyRevenue || []}
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
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats?.charts.topProducts || []}
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
                        {stats?.charts.topProducts.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      {/* Add center label for total revenue */}
                      {stats?.charts.topProducts && stats.charts.topProducts.length > 0 && (
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
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats?.charts.monthlyRevenue || []}
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
                    <div key={invoice.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{invoice.invoiceNumber}</p>
                        <p className="text-xs text-muted-foreground">{invoice.customerName}</p>
                        <p className="text-xs text-muted-foreground">Date: {invoice.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{formatCurrency(invoice.amount, settings)}</p>
                        <div 
                          className={`inline-flex items-center rounded px-2 py-0.5 text-xs font-medium
                            ${invoice.status === 'PAID' ? 'bg-green-100 text-green-700' : 
                            invoice.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 
                            invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 
                            'bg-gray-100 text-gray-700'}`}
                        >
                          {invoice.status}
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
    </div>
  );
}
