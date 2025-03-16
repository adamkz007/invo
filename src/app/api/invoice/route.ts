import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// In-memory storage for invoices during development
let mockInvoiceStorage: Record<string, any[]> = {
  // Default invoices for user ID '1'
  '1': [
    {
      id: 'mock-invoice-1',
      invoiceNumber: 'INV-001',
      status: 'PAID',
      total: 1320.0,
      paidAmount: 1320.0,
      issueDate: new Date('2023-01-15'),
      dueDate: new Date('2023-01-30'),
      userId: '1',
      customerId: 'mock-customer-1',
      customer: {
        name: 'Globex Corp'
      },
      items: [
        {
          id: 'mock-item-1',
          description: 'Web Development',
          quantity: 1,
          unitPrice: 1200.0,
          amount: 1200.0,
          productId: 'mock-product-1'
        }
      ]
    },
    {
      id: 'mock-invoice-2',
      invoiceNumber: 'INV-002',
      status: 'SENT',
      total: 3465.0,
      paidAmount: 0,
      issueDate: new Date('2023-02-10'),
      dueDate: new Date('2023-02-25'),
      userId: '1',
      customerId: 'mock-customer-2',
      customer: {
        name: 'Wayne Enterprises'
      },
      items: [
        {
          id: 'mock-item-2',
          description: 'Mobile App Development',
          quantity: 1,
          unitPrice: 2500.0,
          amount: 2500.0,
          productId: 'mock-product-2'
        }
      ]
    },
    {
      id: 'mock-invoice-3',
      invoiceNumber: 'INV-003',
      status: 'PARTIAL',
      total: 1430.0,
      paidAmount: 800.0,
      issueDate: new Date('2023-03-05'),
      dueDate: new Date('2023-03-20'),
      userId: '1',
      customerId: 'mock-customer-3',
      customer: {
        name: 'Acme Inc'
      },
      items: [
        {
          id: 'mock-item-3',
          description: 'UI/UX Design',
          quantity: 1,
          unitPrice: 800.0,
          amount: 800.0,
          productId: 'mock-product-3'
        }
      ]
    }
  ]
};

// Maximum number of database connection retries
const MAX_RETRIES = 5;

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
    
    // If database is connected, try to use it first
    if (isConnected) {
      try {
        // Fetch invoices for this user with retry logic
        const invoices = await retryDatabaseOperation(() => 
          prisma.invoice.findMany({
            where: {
              userId: userId
            },
            include: {
              customer: {
                select: {
                  name: true
                }
              },
              items: true
            },
            orderBy: {
              createdAt: 'desc'
            }
          })
        );
        
        return NextResponse.json(invoices);
      } catch (dbError) {
        console.error('Database error, falling back to mock storage:', dbError);
      }
    } else {
      console.log('Database not connected, using mock storage');
    }
    
    // Fall back to mock storage
    if (mockInvoiceStorage[userId]) {
      return NextResponse.json(mockInvoiceStorage[userId]);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoices' 
    }, { 
      status: 500 
    });
  }
} 