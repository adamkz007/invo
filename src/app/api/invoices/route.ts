import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken, getUserFromRequest } from '@/lib/auth';
import { hasReachedLimit, hasTrialExpired, PLAN_LIMITS } from '@/lib/stripe';
import { InvoiceFormValues, InvoiceItemFormValues } from '@/types';
import { User } from '@prisma/client';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const invoices = await prisma.invoice.findMany({
      where: {
        userId: user.id,
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get the complete user from the database with subscription info
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id }
    });

    if (!dbUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Cast the user to include subscription fields and use fallbacks
    const fullUser = dbUser as User & { 
      subscriptionStatus?: string | null;
      trialEndDate?: Date | null;
    };

    // Check subscription status - using raw value with fallback
    const subscriptionStatus = fullUser.subscriptionStatus || 'FREE';
    const trialEndDate = fullUser.trialEndDate;
    const isTrialExpired = hasTrialExpired(trialEndDate);
    
    // If trial has expired and user is still on trial, set to FREE using raw query
    if (isTrialExpired && subscriptionStatus === 'TRIAL') {
      await prisma.$executeRaw`
        UPDATE User
        SET subscriptionStatus = 'FREE'
        WHERE id = ${user.id}
      `;
    }

    // Count invoices from current month
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const invoiceCount = await prisma.invoice.count({
      where: { 
        userId: user.id,
        createdAt: {
          gte: firstDayOfMonth
        }
      }
    });

    // Check if user has reached limit (if not on trial and not premium)
    if (subscriptionStatus !== 'ACTIVE' && (isTrialExpired || subscriptionStatus === 'FREE')) {
      const hasReachedInvoiceLimit = hasReachedLimit(
        subscriptionStatus,
        'invoicesPerMonth',
        invoiceCount
      );

      if (hasReachedInvoiceLimit) {
        return NextResponse.json(
          { 
            error: 'You have reached your monthly invoice limit. Please upgrade to premium or wait until next month.',
            limitReached: true,
            currentCount: invoiceCount,
            limit: PLAN_LIMITS.FREE.invoicesPerMonth
          }, 
          { status: 403 }
        );
      }
    }

    // Proceed with creating invoice
    const data = await req.json();
    
    // Get the highest invoice number and increment it
    const highestInvoice = await prisma.invoice.findFirst({
      orderBy: {
        invoiceNumber: 'desc',
      },
    });
    
    // Generate a sequential invoice number
    // Format: INV-XXXX-YYYY where XXXX is sequential and YYYY is timestamp
    const timestamp = Date.now().toString().slice(-4);
    let sequentialNumber = 1;
    
    if (highestInvoice && highestInvoice.invoiceNumber) {
      // Extract the sequential part (after "INV-" and before the second "-")
      const match = highestInvoice.invoiceNumber.match(/INV-(\d+)-/);
      if (match && match[1]) {
        sequentialNumber = parseInt(match[1]) + 1;
      }
    }
    
    // Ensure the sequential number is always 4 digits
    const paddedNumber = sequentialNumber.toString().padStart(4, '0');
    const invoiceNumber = `INV-${paddedNumber}-${timestamp}`;
    
    // Calculate required values for the invoice
    const subtotal = data.items.reduce((sum: number, item: any) => 
      sum + (item.quantity * item.unitPrice), 0);
    
    const taxAmount = (subtotal * (data.taxRate || 0)) / 100;
    const discountAmount = (subtotal * (data.discountRate || 0)) / 100;
    const total = subtotal + taxAmount - discountAmount;
    
    // Create the invoice with the new invoice number
    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        issueDate: data.issueDate || new Date(),
        dueDate: data.dueDate,
        status: data.status,
        subtotal,
        taxRate: data.taxRate || 0,
        taxAmount,
        discountRate: data.discountRate || 0,
        discountAmount,
        total,
        paidAmount: data.paidAmount || 0,
        notes: data.notes,
        userId: user.id,
        customerId: data.customerId,
        items: {
          create: data.items.map((item: any) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            amount: item.quantity * item.unitPrice,
            description: item.description || '',
            productId: item.productId
          }))
        }
      },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    // Update product stock quantities if stock management is enabled
    // Process each item in the invoice
    for (const item of data.items) {
      // Only update stock if stock management is not disabled for this product
      if (!item.disableStockManagement) {
        // Get the current product
        const product = await prisma.product.findUnique({
          where: { id: item.productId }
        });
        
        if (product && !product.disableStockManagement) {
          // Calculate new quantity and ensure it doesn't go below 0
          const newQuantity = Math.max(0, product.quantity - item.quantity);
          
          // Update the product quantity
          await prisma.product.update({
            where: { id: item.productId },
            data: { quantity: newQuantity }
          });
        }
      }
    }

    return NextResponse.json(invoice);
  } catch (error: any) {
    console.error('Error creating invoice:', error);
    // Log detailed error information
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack,
      code: error?.code,
    });
    
    // Provide a more specific error message if possible
    let errorMessage = 'Failed to create invoice';
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
    }
    
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
