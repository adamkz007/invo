import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';
import { verifyToken, parseAuthTokenFromCookie } from '@/lib/auth';

// Define InvoiceStatus enum locally
enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

interface MonthlyDataPoint {
  month: string;
  revenue: number;
  paid: number;
  pending: number;
}

interface ProductRevenue {
  [key: string]: number;
}

interface TopProduct {
  name: string;
  revenue: number;
}

// Cache TTL in seconds (5 minutes)
const CACHE_TTL = 300;

// In-memory cache
const cache = new Map<string, { data: any; timestamp: number }>();

// Maximum number of database connection retries
const MAX_RETRIES = 5;

// Helper function to retry database operations
async function retryDatabaseOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) {
      throw error;
    }
    console.log(`Database operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
    await new Promise(resolve => setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1)));
    return retryDatabaseOperation(operation, retries - 1);
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection().catch(() => false);
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }
    
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    // Verify token and extract the user ID
    let userId;
    try {
      const decoded = await verifyToken(token);
      if (decoded && decoded.id) {
        userId = decoded.id;
      } else {
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    // Check if we have a valid cached response
    const cacheKey = `dashboard_${userId}`;
    const cachedData = cache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL * 1000) {
      return NextResponse.json(cachedData.data);
    }
    
    // Perform all database queries in parallel for better performance
    // Wrap each query with retry logic
    const [
      totalCustomers,
      totalProducts,
      invoices,
      products
    ] = await Promise.all([
      retryDatabaseOperation(() => prisma.customer.count({
        where: { userId }
      })),
      retryDatabaseOperation(() => prisma.product.count({
        where: { userId }
      })),
      retryDatabaseOperation(() => prisma.invoice.findMany({
        where: { userId },
        include: {
          customer: {
            select: {
              name: true
            }
          },
          items: {
            include: {
              product: {
                select: {
                  name: true,
                  price: true
                }
              }
            }
          }
        }
      })),
      retryDatabaseOperation(() => prisma.product.findMany({
        where: { userId },
        select: {
          id: true,
          name: true,
          price: true,
          quantity: true,
          disableStockManagement: true
        }
      }))
    ]);
    
    // Calculate inventory value
    const inventoryValue = products.reduce((total, product) => {
      if (!product.disableStockManagement) {
        return total + (product.price || 0) * (product.quantity || 0);
      }
      return total;
    }, 0);
    
    // Calculate invoice statistics
    const totalInvoices = invoices.length;
    let totalAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    let pendingAmount = 0;
    let outstandingAmount = 0;
    
    // Track revenue by product
    const productRevenue: ProductRevenue = {};
    
    // Prepare data for monthly revenue chart
    const monthlyData = new Map<string, MonthlyDataPoint>();
    
    // Process invoices to calculate statistics
    invoices.forEach(invoice => {
      const invoiceTotal = invoice.items && Array.isArray(invoice.items) 
        ? invoice.items.reduce((sum, item) => {
            return sum + (item.quantity * item.unitPrice);
          }, 0)
        : 0;
      // Use invoice.total if available (should be more accurate)
      const total = typeof invoice.total === 'number' ? invoice.total : invoiceTotal;
      const paid = typeof invoice.paidAmount === 'number' ? invoice.paidAmount : 0;
      
      totalAmount += total;
      paidAmount += paid;
      outstandingAmount += Math.max(0, total - paid);
      
      // Update status-based totals
      if (invoice.status === InvoiceStatus.PAID) {
        // Already counted in paidAmount
      } else if (invoice.status === InvoiceStatus.OVERDUE) {
        overdueAmount += Math.max(0, total - paid);
      } else if (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.PARTIAL) {
        pendingAmount += Math.max(0, total - paid);
      }
      
      // Update product revenue data
      if (invoice.items && Array.isArray(invoice.items)) {
        invoice.items.forEach(item => {
          const productName = item.product?.name || item.description;
          if (productName) {
            if (!productRevenue[productName]) {
              productRevenue[productName] = 0;
            }
            productRevenue[productName] += item.quantity * item.unitPrice;
          }
        });
      }
      
      // Update monthly data
      if (invoice.createdAt) {
        const date = new Date(invoice.createdAt);
        const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
        
        if (!monthlyData.has(monthKey)) {
          monthlyData.set(monthKey, {
            month: monthKey,
            revenue: 0,
            paid: 0,
            pending: 0
          });
        }
        
        const monthData = monthlyData.get(monthKey)!;
        monthData.revenue += total;
        
        if (invoice.status === InvoiceStatus.PAID) {
          monthData.paid += total;
        } else if (invoice.status === InvoiceStatus.SENT || invoice.status === InvoiceStatus.PARTIAL) {
          monthData.pending += Math.max(0, total - paid);
        }
      }
    });
    
    // Sort top products by revenue
    const topProducts: TopProduct[] = Object.entries(productRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Get 6 months of data for the chart, including empty months
    const sixMonthsData: MonthlyDataPoint[] = [];
    const today = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const monthKey = `${date.toLocaleString('en-US', { month: 'short' })} ${date.getFullYear()}`;
      
      if (monthlyData.has(monthKey)) {
        sixMonthsData.push(monthlyData.get(monthKey)!);
      } else {
        sixMonthsData.push({
          month: monthKey,
          revenue: 0,
          paid: 0,
          pending: 0
        });
      }
    }
    
    // Calculate last month's data for growth calculations
    const currentMonth = today.getMonth();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? today.getFullYear() - 1 : today.getFullYear();
    
    // Count last month's invoices, customers, products and revenue
    const lastMonthStart = new Date(lastMonthYear, lastMonth, 1);
    const lastMonthEnd = new Date(today.getFullYear(), currentMonth, 0);
    const currentMonthStart = new Date(today.getFullYear(), currentMonth, 1);
    
    const [lastMonthInvoicesCount, lastMonthCustomersCount, lastMonthProductsCount] = await Promise.all([
      retryDatabaseOperation(() => prisma.invoice.count({
        where: { 
          userId,
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        }
      })),
      retryDatabaseOperation(() => prisma.customer.count({
        where: { 
          userId,
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        }
      })),
      retryDatabaseOperation(() => prisma.product.count({
        where: { 
          userId,
          createdAt: {
            gte: lastMonthStart,
            lt: currentMonthStart
          }
        }
      }))
    ]);
    
    // Calculate last month's revenue
    const lastMonthInvoices = await retryDatabaseOperation(() => prisma.invoice.findMany({
      where: { 
        userId,
        createdAt: {
          gte: lastMonthStart,
          lt: currentMonthStart
        }
      },
      include: {
        items: true
      }
    }));
    
    const lastMonthRevenue = lastMonthInvoices.reduce((total, invoice) => {
      const invoiceTotal = invoice.items && Array.isArray(invoice.items) 
        ? invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        : 0;
      return total + invoiceTotal;
    }, 0);
    
    // Calculate current month's data for comparison
    const currentMonthInvoices = await retryDatabaseOperation(() => prisma.invoice.count({
      where: { 
        userId,
        createdAt: {
          gte: currentMonthStart
        }
      }
    }));
    
    const currentMonthCustomers = await retryDatabaseOperation(() => prisma.customer.count({
      where: { 
        userId,
        createdAt: {
          gte: currentMonthStart
        }
      }
    }));
    
    const currentMonthProducts = await retryDatabaseOperation(() => prisma.product.count({
      where: { 
        userId,
        createdAt: {
          gte: currentMonthStart
        }
      }
    }));
    
    // Get current month revenue
    const currentMonthInvoicesList = await retryDatabaseOperation(() => prisma.invoice.findMany({
      where: { 
        userId,
        createdAt: {
          gte: currentMonthStart
        }
      },
      include: {
        items: true
      }
    }));
    
    const currentMonthRevenue = currentMonthInvoicesList.reduce((total, invoice) => {
      const invoiceTotal = invoice.items && Array.isArray(invoice.items) 
        ? invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
        : 0;
      return total + invoiceTotal;
    }, 0);
    
    // Recent invoices (last 3)
    const recentInvoices = invoices
      .sort((a, b) => {
        return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      })
      .slice(0, 3)
      .map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer?.name || 'Unknown Customer',
        amount: invoice.items && Array.isArray(invoice.items) 
          ? invoice.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
          : 0,
        status: invoice.status,
        date: invoice.createdAt ? new Date(invoice.createdAt).toISOString().split('T')[0] : ''
      }));
    
    // Prepare dashboard data response
    const dashboardData = {
      totalInvoices,
      totalCustomers,
      totalProducts,
      inventoryValue,
      invoiceStats: {
        totalAmount,
        paidAmount,
        overdueAmount,
        pendingAmount,
        outstandingAmount,
        recentInvoices
      },
      charts: {
        monthlyRevenue: sixMonthsData,
        topProducts
      },
      growth: {
        lastMonthInvoices: lastMonthInvoicesCount,
        lastMonthCustomers: lastMonthCustomersCount,
        lastMonthProducts: lastMonthProductsCount,
        lastMonthRevenue: lastMonthRevenue,
        currentMonthInvoices: currentMonthInvoices,
        currentMonthCustomers: currentMonthCustomers,
        currentMonthProducts: currentMonthProducts,
        currentMonthRevenue: currentMonthRevenue
      }
    };
    
    // Store in cache
    cache.set(cacheKey, {
      data: dashboardData,
      timestamp: now
    });
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ error: 'Failed to fetch dashboard data' }, { status: 500 });
  }
} 