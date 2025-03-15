import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';
import { InvoiceStatus } from '@prisma/client';

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

export async function GET(request: NextRequest) {
  try {
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
    
    // Get total counts
    const totalCustomers = await prisma.customer.count({
      where: { userId }
    });
    
    const totalProducts = await prisma.product.count({
      where: { userId }
    });
    
    // Get invoices with their status
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        customer: {
          select: {
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    const totalInvoices = invoices.length;
    
    // Calculate invoice statistics
    let totalAmount = 0;
    let paidAmount = 0;
    let overdueAmount = 0;
    let pendingAmount = 0;
    
    invoices.forEach(invoice => {
      totalAmount += invoice.total;
      
      if (invoice.status === InvoiceStatus.PAID) {
        paidAmount += invoice.total;
      } else if (invoice.status === InvoiceStatus.OVERDUE) {
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
    
    // Get inventory value
    const products = await prisma.product.findMany({
      where: { userId }
    });
    
    const inventoryValue = products.reduce((total, product) => {
      // Only include physical products (not services)
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
    
    const invoicesByMonth = await prisma.invoice.findMany({
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
    });
    
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
        
        if (invoice.status === InvoiceStatus.PAID) {
          monthlyData[monthIndex].paid += invoice.total;
        } else {
          monthlyData[monthIndex].pending += invoice.total;
        }
      }
    });
    
    // Get top products by revenue
    const invoiceItems = await prisma.invoiceItem.findMany({
      where: {
        invoice: {
          userId
        }
      },
      include: {
        product: {
          select: {
            name: true
          }
        }
      }
    });
    
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
    
    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch dashboard data' 
    }, { 
      status: 500 
    });
  }
} 