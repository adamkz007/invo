import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, parseAuthTokenFromCookie } from '@/lib/auth';

// Define InvoiceStatus enum locally
enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// GET a specific invoice
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
    
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
    
    // Fetch the invoice with customer details
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
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
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
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
        id: id,
        userId: userId
      }
    });
    
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
    }
    
    let updatedInvoice;
    
    if (action === 'cancel') {
      // First, get the invoice with its items and products to know what quantities to restore
      const invoiceWithItems = await prisma.invoice.findFirst({
        where: { id: id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      if (!invoiceWithItems) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      
      // Restore product quantities for inventory management if the invoice was PAID or PARTIAL
      if (invoiceWithItems.status === InvoiceStatus.PAID || invoiceWithItems.status === InvoiceStatus.PARTIAL || invoiceWithItems.status === InvoiceStatus.SENT) {
        for (const item of invoiceWithItems.items) {
          if (!item.product.disableStockManagement) {
            await prisma.product.update({
              where: { id: item.product.id },
              data: {
                quantity: {
                  increment: item.quantity
                }
              }
            });
          }
        }
      }

      // Update invoice status to CANCELLED
      updatedInvoice = await prisma.invoice.update({
        where: { id: id },
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
      // Get the current invoice status
      const currentInvoice = await prisma.invoice.findUnique({
        where: { id: id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      if (!currentInvoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      
      // If the invoice is being transitioned from DRAFT to SENT, 
      // we need to reduce the product quantities
      if (currentInvoice.status === InvoiceStatus.DRAFT) {
        for (const item of currentInvoice.items) {
          if (!item.product.disableStockManagement) {
            await prisma.product.update({
              where: { id: item.product.id },
              data: {
                quantity: {
                  decrement: item.quantity
                }
              }
            });
          }
        }
      }
      
      // Update invoice status to SENT
      updatedInvoice = await prisma.invoice.update({
        where: { id: id },
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
      
      // Get the current invoice with items and products
      const currentInvoice = await prisma.invoice.findUnique({
        where: { id: id },
        include: {
          items: {
            include: {
              product: true
            }
          }
        }
      });
      
      if (!currentInvoice) {
        return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
      }
      
      // Determine the new status based on the payment amount
      let newStatus: InvoiceStatus;
      let newPaidAmount = amountPaid;
      
      // If there's an existing paidAmount, add to it
      if (currentInvoice.paidAmount) {
        newPaidAmount += currentInvoice.paidAmount;
      }
      
      if (newPaidAmount >= currentInvoice.total) {
        // Full payment
        newStatus = InvoiceStatus.PAID;
      } else {
        // Partial payment
        newStatus = InvoiceStatus.PARTIAL;
      }
      
      // If the invoice is being transitioned from DRAFT to PAID or PARTIAL, 
      // we need to reduce the product quantities
      if (currentInvoice.status === InvoiceStatus.DRAFT) {
        for (const item of currentInvoice.items) {
          if (!item.product.disableStockManagement) {
            await prisma.product.update({
              where: { id: item.product.id },
              data: {
                quantity: {
                  decrement: item.quantity
                }
              }
            });
          }
        }
      }
      
      // Update the invoice with the new status and paid amount
      updatedInvoice = await prisma.invoice.update({
        where: { id: id },
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
  { params }: { params: { id: string } }
) {
  try {
    const id = await Promise.resolve(params.id);
    
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
    
    // Fetch the invoice with its items and products to know what quantities to restore
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: id,
        userId: userId
      },
      include: {
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
    
    // If the invoice status is PAID, PARTIAL, or SENT, restore product quantities
    if (invoice.status === 'PAID' || invoice.status === 'PARTIAL' || invoice.status === 'SENT') {
      for (const item of invoice.items) {
        if (!item.product.disableStockManagement) {
          await prisma.product.update({
            where: { id: item.product.id },
            data: {
              quantity: {
                increment: item.quantity
              }
            }
          });
        }
      }
    }
    
    // Delete the invoice items first
    await prisma.invoiceItem.deleteMany({
      where: {
        invoiceId: id
      }
    });
    
    // Then delete the invoice
    await prisma.invoice.delete({
      where: {
        id: id
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