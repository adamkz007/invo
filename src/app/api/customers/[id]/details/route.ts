import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

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
    
    // Type assertion to include the new fields
    type CustomerWithInvoices = {
      id: string;
      name: string;
      email: string | null;
      phoneNumber: string | null;
      street: string | null;
      city: string | null;
      postcode: string | null;
      state: string | null;
      country: string | null;
      registrationType: string | null;
      registrationNumber: string | null;
      taxIdentificationNumber: string | null;
      notes: string | null;
      createdAt: Date;
      updatedAt: Date;
      userId: string;
      invoices: { id: string; status: string; total: number; }[];
    };
    
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
    
    // Cast customer to include all the fields we need to return
    const customerWithAllFields = customer as CustomerWithInvoices;
    
    return NextResponse.json({
      id: customerWithAllFields.id,
      name: customerWithAllFields.name,
      email: customerWithAllFields.email,
      phoneNumber: customerWithAllFields.phoneNumber,
      street: customerWithAllFields.street,
      city: customerWithAllFields.city,
      postcode: customerWithAllFields.postcode,
      state: customerWithAllFields.state,
      country: customerWithAllFields.country,
      registrationType: customerWithAllFields.registrationType,
      registrationNumber: customerWithAllFields.registrationNumber,
      taxIdentificationNumber: customerWithAllFields.taxIdentificationNumber,
      notes: customerWithAllFields.notes,
      createdAt: customerWithAllFields.createdAt,
      updatedAt: customerWithAllFields.updatedAt,
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