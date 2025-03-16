import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection, batchTransactions } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// In-memory storage for customers during development
let mockCustomerStorage: Record<string, any[]> = {
  // Default customers for user ID '1'
  '1': [
    {
      id: 'mock-customer-1',
      name: 'Globex Corp',
      email: 'info@globex.com',
      phoneNumber: '555-123-4567',
      address: '123 Global Ave, Springfield',
      notes: 'Large enterprise client',
      userId: '1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'mock-customer-2',
      name: 'Wayne Enterprises',
      email: 'business@wayne.com',
      phoneNumber: '555-987-6543',
      address: '1007 Mountain Drive, Gotham City',
      notes: 'Important client, handle with care',
      userId: '1',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    },
    {
      id: 'mock-customer-3',
      name: 'Acme Inc',
      email: 'contact@acme.com',
      phoneNumber: '555-456-7890',
      address: '42 Desert Road, Coyote County',
      notes: 'Regular client, orders frequently',
      userId: '1',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03')
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
        // Fetch customers for this user with retry logic and select only needed fields
        const customers = await retryDatabaseOperation(() => 
          prisma.customer.findMany({
            where: {
              userId: userId
            },
            orderBy: {
              createdAt: 'desc'
            },
            select: {
              id: true,
              name: true,
              email: true,
              phoneNumber: true,
              address: true,
              notes: true,
              createdAt: true,
              updatedAt: true,
              userId: true
            }
          })
        );
        
        return NextResponse.json(customers);
      } catch (dbError) {
        console.error('Database error, falling back to mock storage:', dbError);
      }
    } else {
      console.log('Database not connected, using mock storage');
    }
    
    // Fall back to mock storage
    if (mockCustomerStorage[userId]) {
      return NextResponse.json(mockCustomerStorage[userId]);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customers' 
    }, { 
      status: 500 
    });
  }
} 