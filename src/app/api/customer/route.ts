import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection, batchTransactions } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    
    // Try to get customers from the database
    try {
      const customers = await retryDatabaseOperation(() => 
        prisma.customer.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        })
      );
      
      return NextResponse.json(customers);
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error handling customer request:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection().catch(() => false);
    if (!isConnected) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 503 });
    }
    
    const customerData = await request.json();
    
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
        customerData.userId = userId;
      } else {
        return NextResponse.json({ error: 'Invalid authentication token' }, { status: 401 });
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }
    
    // Create the customer in the database
    try {
      const newCustomer = await retryDatabaseOperation(() => 
        prisma.customer.create({
          data: customerData
        })
      );
      
      return NextResponse.json(newCustomer, { status: 201 });
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
  } catch (error) {
    console.error('Error handling customer creation:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}