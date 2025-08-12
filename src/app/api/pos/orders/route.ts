import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../middleware';

// Generate unique order number for customer identification
function generateOrderNumber(orderType: string = 'DINE_IN'): string {
  // Create a simple sequential number for the day
  const today = new Date();
  const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
  
  // Use last 2 digits of timestamp for uniqueness within the same second
  const timestamp = Date.now().toString().slice(-2);
  
  // Generate a 3-digit random number
  const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
  
  // Create a prefix based on order type
  let prefix = 'D'; // Default for DINE_IN
  if (orderType === 'TAKEAWAY') prefix = 'T';
  if (orderType === 'DELIVERY') prefix = 'DL';
  
  // Format: [Type Prefix]-[Last 3 digits of date + random]
  return `${prefix}${dateStr.slice(-2)}${timestamp}${random}`;
}

// GET /api/pos/orders - Get all POS orders for the user
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const whereClause: any = {
      userId: user.id,
    };

    if (status) {
      whereClause.status = status;
    }

    const orders = await prisma.posOrder.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        table: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      skip: offset,
    });

    const totalCount = await prisma.posOrder.count({
      where: whereClause,
    });

    return NextResponse.json({
      orders,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error('Error fetching POS orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST /api/pos/orders - Create a new POS order
export async function POST(request: NextRequest) {
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
    const { tableNumber, tableId, items, notes, orderType = 'DINE_IN' } = body;

    // Validate required fields
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Items are required' },
        { status: 400 }
      );
    }
    
    // For DINE_IN orders, table is required
    if (orderType === 'DINE_IN' && !tableNumber) {
      return NextResponse.json(
        { error: 'Table number is required for dine-in orders' },
        { status: 400 }
      );
    }

    // Validate stock availability
    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${item.productId}` },
          { status: 400 }
        );
      }

      if (!product.disableStockManagement && product.quantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for ${product.name}` },
          { status: 400 }
        );
      }
    }

    // Calculate totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
      });

      const unitPrice = item.unitPrice || product!.price;
      const amount = unitPrice * item.quantity;
      subtotal += amount;

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        amount,
        notes: item.notes || null,
      });
    }

    // Get tax rate from POS settings
    const posSettings = await prisma.posSettings.findUnique({
      where: { userId: user.id },
    });

    const taxRate = posSettings?.taxRate || 0;
    const serviceChargeRate = posSettings?.serviceChargeRate || 0;
    const serviceCharge = body.serviceCharge || (subtotal * (serviceChargeRate / 100));
    const taxAmount = body.taxAmount || ((subtotal + serviceCharge) * (taxRate / 100));
    const total = subtotal + serviceCharge + taxAmount;

    // Create the order
    const order = await prisma.posOrder.create({
      data: {
        orderNumber: generateOrderNumber(orderType),
        tableNumber,
        tableId: tableId || null,
        orderType,
        subtotal,
        taxRate,
        taxAmount,
        total,
        notes: notes || null,
        userId: user.id,
        items: {
          create: orderItems,
        },
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

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating POS order:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}