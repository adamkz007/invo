import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { InvoiceStatus } from '@prisma/client';
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
    
    // Fetch invoices with customer details for this user
    const invoices = await prisma.invoice.findMany({
      where: {
        userId: userId
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        items: {
          include: {
            product: {
              select: {
                name: true,
                description: true,
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc' // Most recent invoices first
      }
    });

    // Transform the invoices to match the InvoiceWithDetails type
    const transformedInvoices = invoices.map(invoice => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      customer: {
        id: invoice.customer.id,
        name: invoice.customer.name,
        email: invoice.customer.email,
      },
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status,
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      discountRate: invoice.discountRate,
      discountAmount: invoice.discountAmount,
      total: invoice.total,
      items: invoice.items.map(item => ({
        id: item.id,
        product: {
          name: item.product.name,
          description: item.product.description || '',
        },
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }))
    }));

    return NextResponse.json(transformedInvoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoices' 
    }, { 
      status: 500 
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Use the provided user ID or default to a demo user ID if no token is found
    let userId = data.userId || '1'; // Default user ID for demo purposes
    
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
    
    // Generate invoice number (format: INV-YYYYMMDD-XXXX)
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const randomStr = Math.floor(1000 + Math.random() * 9000).toString();
    const invoiceNumber = `INV-${dateStr}-${randomStr}`;
    
    // Extract items from the request
    const { items, customerId, issueDate, dueDate, status, taxRate, discountRate, notes, subtotal, taxAmount, discountAmount, total } = data;
    
    // Create invoice with items
    const newInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate: new Date(issueDate),
        dueDate: new Date(dueDate),
        status: status as InvoiceStatus,
        subtotal,
        taxRate,
        taxAmount,
        discountRate,
        discountAmount,
        total,
        notes,
        customer: {
          connect: { id: customerId }
        },
        user: {
          // Connect to the current user
          connect: { id: userId }
        },
        items: {
          create: items.map((item: any) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            description: item.description,
            product: {
              connect: { id: item.productId }
            }
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      }
    });

    return NextResponse.json(newInvoice, { status: 201 });
  } catch (error) {
    console.error('Error creating invoice:', error);
    return NextResponse.json({ 
      error: 'Failed to create invoice' 
    }, { 
      status: 500 
    });
  }
}
