import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = await Promise.resolve(params.id);
    
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
      }
    });
    
    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error fetching customer:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch customer' 
    }, { 
      status: 500 
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = await Promise.resolve(params.id);
    const customerData = await request.json();
    
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
    
    // Check if the customer exists and belongs to the user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: userId
      }
    });
    
    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Check if another customer with the same phone number already exists
    if (customerData.phoneNumber) {
      const duplicatePhoneCustomer = await prisma.customer.findFirst({
        where: {
          userId: userId,
          phoneNumber: customerData.phoneNumber,
          id: { not: customerId } // Exclude the current customer
        }
      });
      
      if (duplicatePhoneCustomer) {
        return NextResponse.json(
          { 
            error: 'Another customer with this phone number already exists', 
            duplicatePhone: true,
          }, 
          { status: 409 }
        );
      }
    }
    
    // Update the customer
    const updatedCustomer = await prisma.customer.update({
      where: {
        id: customerId
      },
      data: {
        ...customerData,
        userId // Ensure the userId remains the same
      }
    });
    
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to update customer: ${error.message}` 
      }, { 
        status: 500 
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to update customer' 
    }, { 
      status: 500 
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = await Promise.resolve(params.id);
    
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
    
    // Check if the customer exists and belongs to the user
    const existingCustomer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        userId: userId
      }
    });
    
    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }
    
    // Delete the customer
    await prisma.customer.delete({
      where: {
        id: customerId
      }
    });
    
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to delete customer: ${error.message}` 
      }, { 
        status: 500 
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to delete customer' 
    }, { 
      status: 500 
    });
  }
}