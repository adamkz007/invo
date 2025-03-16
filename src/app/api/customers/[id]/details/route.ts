import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// Define the params type according to Next.js 15 requirements
type Params = { id: string };

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const customerId = params.id;
    
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
    
    // Find the customer by ID and ensure it belongs to the user
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: userId
      },
      include: {
        invoices: {
          select: {
            id: true,
            total: true,
            status: true
          }
        }
      }
    });
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Calculate total purchases (sum of all invoice totals)
    const totalPurchases = customer.invoices.reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Calculate paid purchases (sum of invoices with status PAID or PARTIAL)
    const paidPurchases = customer.invoices
      .filter(invoice => ['PAID', 'PARTIAL'].includes(invoice.status))
      .reduce((sum, invoice) => sum + invoice.total, 0);
    
    // Count total invoices
    const invoiceCount = customer.invoices.length;
    
    return NextResponse.json({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      notes: customer.notes,
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
      totalPurchases,
      paidPurchases,
      invoiceCount
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customer details' 
    }, { 
      status: 500 
    });
  }
} 