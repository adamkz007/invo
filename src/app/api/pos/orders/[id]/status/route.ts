import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../../../middleware';

// PATCH /api/pos/orders/[id]/status - Update order status
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check if POS module is enabled
  const middlewareResponse = await posModuleMiddleware(request);
  if (middlewareResponse.status !== 200) {
    return middlewareResponse;
  }
  
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { status } = body;

    // Validate status
    const validStatuses = ['KITCHEN', 'TO_PAY', 'COMPLETED', 'CANCELLED'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: ' + validStatuses.join(', ') },
        { status: 400 }
      );
    }

    // Check if order exists and belongs to user
    const existingOrder = await prisma.posOrder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Prevent status changes on already completed/cancelled orders
    if (existingOrder.status === 'COMPLETED' || existingOrder.status === 'CANCELLED') {
      return NextResponse.json(
        { error: 'Cannot change status of completed or cancelled orders' },
        { status: 400 }
      );
    }

    // If completing the order, update inventory and create receipt
    if (status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
      // Update inventory for products with stock management enabled
      for (const item of existingOrder.items) {
        if (!item.product.disableStockManagement) {
          await prisma.product.update({
            where: { id: item.productId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      // Create receipt
      await createReceiptFromOrder(existingOrder, user.id);
    }

    // Update the order status
    const updatedOrder = await prisma.posOrder.update({
      where: { id: params.id },
      data: {
        status,
        updatedAt: new Date(),
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        table: true,
      },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Order status updated to ${status}`,
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    );
  }
}

// Helper function to create receipt from completed order
async function createReceiptFromOrder(order: any, userId: string) {
  try {
    // Generate receipt number
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    const receiptNumber = `RCP${timestamp}${random}`;

    // Create receipt
    const receipt = await prisma.receipt.create({
      data: {
        receiptNumber,
        customerName: order.tableNumber,
        customerPhone: null,
        receiptDate: new Date(),
        paymentMethod: 'CASH',
        total: order.total,
        notes: `Generated from POS Order: ${order.orderNumber}`,
        userId,
        items: {
          create: order.items.map((item: any) => ({
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            description: item.product.name + (item.notes ? ` (${item.notes})` : ''),
            productId: item.productId,
          })),
        },
      },
    });

    console.log(`Receipt ${receipt.receiptNumber} created for order ${order.orderNumber}`);
    return receipt;
  } catch (error) {
    console.error('Error creating receipt from order:', error);
    throw error;
  }
}