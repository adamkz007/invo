import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const CUSTOMERS_TAG = (userId: string) => `customers:${userId}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = await Promise.resolve(params.id);
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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
    
    revalidateTag(CUSTOMERS_TAG(userId));
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

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

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
    
    revalidateTag(CUSTOMERS_TAG(userId));
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
