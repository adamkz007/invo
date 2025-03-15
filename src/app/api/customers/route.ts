import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

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
    
    // Find customers for this user
    const customers = await prisma.customer.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customers' 
    }, { 
      status: 500 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const customerData = await request.json();
    
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Use the provided user ID or default to a demo user ID if no token is found
    let userId = customerData.userId || '1'; // Default user ID for demo purposes
    
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
    
    // Ensure userId is set in the customer data
    const customerWithUserId = {
      ...customerData,
      userId
    };
    
    console.log('Creating customer with data:', customerWithUserId);
    
    // Create customer using Prisma
    const newCustomer = await prisma.customer.create({
      data: customerWithUserId
    });

    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to create customer: ${error.message}` 
      }, { 
        status: 500 
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create customer' 
    }, { 
      status: 500 
    });
  }
} 