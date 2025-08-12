import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../../middleware';

// GET /api/pos/orders/[id] - Get a specific POS order
export async function GET(
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

    const order = await prisma.posOrder.findFirst({
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
        table: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching POS order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

// PATCH /api/pos/orders/[id] - Update order status or details
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
    const { status, notes } = body;

    // Validate status if provided
    const validStatuses = ['KITCHEN', 'TO_PAY', 'COMPLETED', 'CANCELLED'];
    if (status && !validStatuses.includes(status)) {
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

    // If completing the order, update inventory
    if (status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
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

      // Create receipt if order is completed
      await createReceiptFromOrder(existingOrder, user.id);
    }

    // Update the order
    const updatedOrder = await prisma.posOrder.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(notes !== undefined && { notes }),
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

    return NextResponse.json(updatedOrder);
  } catch (error) {
    console.error('Error updating POS order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

// DELETE /api/pos/orders/[id] - Cancel/delete an order
export async function DELETE(
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

    // Check if order exists and belongs to user
    const existingOrder = await prisma.posOrder.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Only allow deletion of orders that haven't been completed
    if (existingOrder.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'Cannot delete completed orders' },
        { status: 400 }
      );
    }

    // Update status to cancelled instead of deleting
    const cancelledOrder = await prisma.posOrder.update({
      where: { id: params.id },
      data: {
        status: 'CANCELLED',
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({ message: 'Order cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling POS order:', error);
    return NextResponse.json(
      { error: 'Failed to cancel order' },
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
    await prisma.receipt.create({
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
  } catch (error) {
    console.error('Error creating receipt from order:', error);
    // Don't throw error as this is a secondary operation
  }
}