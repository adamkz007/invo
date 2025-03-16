import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, parseAuthTokenFromCookie } from '@/lib/auth';

// Define invoice status constants to match the schema
const InvoiceStatus = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  PAID: 'PAID',
  PARTIAL: 'PARTIAL',
  CANCELLED: 'CANCELLED'
};

// GET a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = id;
    
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
    
    // Find the invoice by ID and ensure it belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId
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
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    return NextResponse.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch invoice' 
    }, { 
      status: 500 
    });
  }
}

// PATCH to update invoice status (cancel or apply payment)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = id;
    const data = await request.json();
    const { action, paymentAmount } = data;
    
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
    
    // Fetch the invoice to ensure it exists and belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId
      }
    });
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    let updatedInvoice;
    
    if (action === 'cancel') {
      // Update invoice status to CANCELLED
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.CANCELLED
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
    } else if (action === 'mark_sent') {
      // Update invoice status to SENT
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: InvoiceStatus.SENT
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
    } else if (action === 'payment') {
      // Apply payment to the invoice
      const amountPaid = parseFloat(paymentAmount);
      
      if (isNaN(amountPaid) || amountPaid <= 0) {
        return NextResponse.json({ 
          error: 'Invalid payment amount' 
        }, { 
          status: 400 
        });
      }
      
      // Determine the new status based on the payment amount
      let newStatus: string;
      let newPaidAmount = amountPaid;
      
      // If there's an existing paidAmount, add to it
      if (invoice.paidAmount) {
        newPaidAmount += invoice.paidAmount;
      }
      
      if (newPaidAmount >= invoice.total) {
        // Full payment
        newStatus = InvoiceStatus.PAID;
      } else {
        // Partial payment
        newStatus = InvoiceStatus.PARTIAL;
      }
      
      // Update the invoice with the new status and paid amount
      updatedInvoice = await prisma.invoice.update({
        where: { id: invoiceId },
        data: {
          status: newStatus,
          paidAmount: newPaidAmount
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
    } else {
      return NextResponse.json({ 
        error: 'Invalid action' 
      }, { 
        status: 400 
      });
    }
    
    return NextResponse.json(updatedInvoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    return NextResponse.json({ 
      error: 'Failed to update invoice' 
    }, { 
      status: 500 
    });
  }
}

// DELETE an invoice
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const invoiceId = id;
    
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
    
    // Fetch the invoice to ensure it exists and belongs to the user
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId
      }
    });
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    // Delete the invoice items first
    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: invoiceId
      }
    });
    
    // Then delete the invoice
    await prisma.invoice.delete({
      where: {
        id: invoiceId
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return NextResponse.json({ 
      error: 'Failed to delete invoice' 
    }, { 
      status: 500 
    });
  }
} 