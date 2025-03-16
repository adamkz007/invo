import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';
import { verifyToken, parseAuthTokenFromCookie } from '@/lib/auth';

// Define invoice status constants to match the schema
const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  CANCELLED: 'CANCELLED',
  OVERDUE: 'OVERDUE'
};

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

// Mock dashboard data for when the database is unavailable
const mockDashboardData = {
  totalInvoices: 3,
  totalCustomers: 3,
  totalProducts: 5,
  inventoryValue: 36500,
  invoiceStats: {
    totalAmount: 6215,
    paidAmount: 2120,
    overdueAmount: 0,
    pendingAmount: 4095,
    recentInvoices: [
      {
        id: 'mock-invoice-1',
        invoiceNumber: 'INV-001',
        customerName: 'Globex Corp',
        amount: 1320,
        status: 'PAID',
        date: '2023-01-15'
      },
      {
        id: 'mock-invoice-2',
        invoiceNumber: 'INV-002',
        customerName: 'Wayne Enterprises',
        amount: 3465,
        status: 'SENT',
        date: '2023-02-10'
      },
      {
        id: 'mock-invoice-3',
        invoiceNumber: 'INV-003',
        customerName: 'Acme Inc',
        amount: 1430,
        status: 'PARTIAL',
        date: '2023-03-05'
      }
    ]
  },
  charts: {
    monthlyRevenue: [
      {
        month: 'Jan 2023',
        revenue: 1320,
        paid: 1320,
        pending: 0
      },
      {
        month: 'Feb 2023',
        revenue: 3465,
        paid: 0,
        pending: 3465
      },
      {
        month: 'Mar 2023',
        revenue: 1430,
        paid: 800,
        pending: 630
      },
      {
        month: 'Apr 2023',
        revenue: 0,
        paid: 0,
        pending: 0
      },
      {
        month: 'May 2023',
        revenue: 0,
        paid: 0,
        pending: 0
      },
      {
        month: 'Jun 2023',
        revenue: 0,
        paid: 0,
        pending: 0
      }
    ],
    topProducts: [
      {
        name: 'Mobile App Development',
        revenue: 2500
      },
      {
        name: 'Web Development',
        revenue: 1200
      },
      {
        name: 'UI/UX Design',
        revenue: 800
      },
      {
        name: 'SEO Service',
        revenue: 500
      },
      {
        name: 'Hosting (Monthly)',
        revenue: 25
      }
    ]
  }
};

// Helper function to retry database operations
async function retryDatabaseOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Database operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      // Wait a bit before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1)));
      return retryDatabaseOperation(operation, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection().catch(() => false);
    if (!isConnected) {
      console.log('Database connection test failed, using mock data');
      return NextResponse.json(mockDashboardData);
    }
    
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Default to a demo user ID if no token is found
    let userId = '1'; // Default user ID for demo purposes
    
    // If token exists, verify it and extract the user ID
    if (token) {
      try {
        const decoded = await verifyToken(token);
        if (decoded && decoded.id) {
          userId = decoded.id;
        }
      } catch (error) {
        console.error('Error verifying token:', error);
      }
    }
    
    // Check if we have a valid cached response
    const cacheKey = `dashboard_${userId}`;
    const cachedData = cache.get(cacheKey);
    const now = Date.now();
    
    if (cachedData && (now - cachedData.timestamp) < CACHE_TTL * 1000) {
      return NextResponse.json(cachedData.data);
    }
    
    try {
      // Perform all database queries in parallel for better performance
      // Wrap each query with retry logic
      const [
        totalCustomers,
        totalProducts,
        invoices,
        products
      ] = await Promise.all([
        retryDatabaseOperation(() => prisma.customer.count({ where: { userId } })),
        retryDatabaseOperation(() => prisma.product.count({ where: { userId } })),
        retryDatabaseOperation(() => prisma.invoice.findMany({
          where: { userId },
          select: {
            id: true,
            invoiceNumber: true,
            issueDate: true,
            dueDate: true,
            status: true,
            subtotal: true,
            taxRate: true,
            taxAmount: true,
            discountRate: true,
            discountAmount: true,
            total: true,
            paidAmount: true,
            notes: true,
            createdAt: true,
            updatedAt: true,
            customerId: true,
            userId: true,
            customer: {
              select: {
                name: true,
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        })),
        retryDatabaseOperation(() => prisma.product.findMany({
          where: { userId },
          select: {
            price: true,
            quantity: true,
            disableStockManagement: true
          }
        }))
      ]);
      
      const totalInvoices = invoices.length;
      
      // Calculate invoice statistics
      let totalAmount = 0;
      let paidAmount = 0;
      let overdueAmount = 0;
      let pendingAmount = 0;
      
      invoices.forEach(invoice => {
        // Skip cancelled invoices in revenue calculations
        if (invoice.status === 'CANCELLED') {
          return;
        }
        
        totalAmount += invoice.total;
        
        if (invoice.status === 'PAID') {
          paidAmount += invoice.total;
        } else if (invoice.status === 'PARTIAL') {
          // For partial payments, use the paid amount field
          const invoicePaidAmount = invoice.paidAmount || 0;
          paidAmount += invoicePaidAmount;
          pendingAmount += invoice.total - invoicePaidAmount;
        } else if (invoice.status === 'OVERDUE') {
          overdueAmount += invoice.total;
        } else {
          pendingAmount += invoice.total;
        }
      });
      
      // Get recent invoices (last 4)
      const recentInvoices = invoices.slice(0, 4).map(invoice => ({
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        customerName: invoice.customer.name,
        amount: invoice.total,
        status: invoice.status,
        date: invoice.issueDate.toISOString().split('T')[0]
      }));
      
      // Calculate inventory value more efficiently
      const inventoryValue = products.reduce((total, product) => {
        if (!product.disableStockManagement) {
          return total + (product.price * product.quantity);
        }
        return total;
      }, 0);
      
      // Get monthly revenue data for chart
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
      sixMonthsAgo.setDate(1);
      sixMonthsAgo.setHours(0, 0, 0, 0);
      
      // Optimize the invoice query by only selecting the fields we need
      const invoicesByMonth = await retryDatabaseOperation(() => prisma.invoice.findMany({
        where: {
          userId,
          createdAt: {
            gte: sixMonthsAgo
          }
        },
        select: {
          total: true,
          createdAt: true,
          status: true
        }
      }));
      
      // Prepare monthly data
      const monthlyData: MonthlyDataPoint[] = [];
      for (let i = 0; i < 6; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        
        monthlyData.unshift({
          month: `${month} ${year}`,
          revenue: 0,
          paid: 0,
          pending: 0
        });
      }
      
      // Fill in the data
      invoicesByMonth.forEach(invoice => {
        const date = new Date(invoice.createdAt);
        
        const monthIndex = monthlyData.findIndex(m => {
          const [month, year] = m.month.split(' ');
          const monthDate = new Date(`${month} 1, ${year}`);
          return monthDate.getMonth() === date.getMonth() && 
                 monthDate.getFullYear() === date.getFullYear();
        });
        
        if (monthIndex !== -1) {
          monthlyData[monthIndex].revenue += invoice.total;
          
          if (invoice.status === 'PAID') {
            monthlyData[monthIndex].paid += invoice.total;
          } else {
            monthlyData[monthIndex].pending += invoice.total;
          }
        }
      });
      
      // Get top products by revenue - optimize by using a more efficient query
      const invoiceItems = await retryDatabaseOperation(() => prisma.invoiceItem.findMany({
        where: {
          invoice: {
            userId
          }
        },
        select: {
          amount: true,
          product: {
            select: {
              name: true
            }
          }
        }
      }));
      
      const productRevenue: ProductRevenue = {};
      invoiceItems.forEach(item => {
        const productName = item.product?.name || 'Unknown Product';
        if (!productRevenue[productName]) {
          productRevenue[productName] = 0;
        }
        productRevenue[productName] += item.amount;
      });
      
      const topProducts: TopProduct[] = Object.entries(productRevenue)
        .map(([name, revenue]) => ({ name, revenue }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
      
      // Prepare response
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
          recentInvoices
        },
        charts: {
          monthlyRevenue: monthlyData,
          topProducts
        }
      };
      
      // Store in cache
      cache.set(cacheKey, {
        data: dashboardData,
        timestamp: now
      });
      
      return NextResponse.json(dashboardData);
    } catch (error) {
      console.error('Database query error, falling back to mock data:', error);
      return NextResponse.json(mockDashboardData);
    }
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(mockDashboardData);
  }
} 