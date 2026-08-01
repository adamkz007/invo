import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { updateCustomerSchema } from '@/lib/schemas/customer';
import { safeErrorResponse } from '@/lib/api-error';

const CUSTOMERS_TAG = (userId: string) => `customers:${userId}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customerId = await Promise.resolve(params.id);

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const customer = await prisma.customer.findFirst({
      where: { id: customerId, userId: user.id },
    });

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json(customer);
  } catch (error) {
    return safeErrorResponse(error, 'Failed to fetch customer');
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customerId = await Promise.resolve(params.id);
    const body = await request.json();

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let customerData: z.infer<typeof updateCustomerSchema>;
    try {
      customerData = updateCustomerSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 },
        );
      }
      throw error;
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: { id: customerId, userId: user.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    if (customerData.phoneNumber) {
      const duplicatePhoneCustomer = await prisma.customer.findFirst({
        where: {
          userId: user.id,
          phoneNumber: customerData.phoneNumber,
          id: { not: customerId },
        },
      });

      if (duplicatePhoneCustomer) {
        return NextResponse.json(
          {
            error: 'Another customer with this phone number already exists',
            duplicatePhone: true,
          },
          { status: 409 },
        );
      }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: customerData,
    });

    revalidateTag(CUSTOMERS_TAG(user.id));
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update customer');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const customerId = await Promise.resolve(params.id);

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingCustomer = await prisma.customer.findFirst({
      where: { id: customerId, userId: user.id },
    });

    if (!existingCustomer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    await prisma.customer.delete({ where: { id: customerId } });

    revalidateTag(CUSTOMERS_TAG(user.id));
    return NextResponse.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to delete customer');
  }
}
