import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { posModuleMiddleware } from '../../middleware';

// POST /api/pos/print/chit - Print kitchen chit for an order
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
    const { orderId, printerAddress } = body;

    if (!orderId) {
      return NextResponse.json(
        { error: 'Order ID is required' },
        { status: 400 }
      );
    }

    // Get the order with items
    const order = await prisma.posOrder.findFirst({
      where: {
        id: orderId,
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

    // Generate kitchen chit content
    const chitContent = generateKitchenChitContent(order);

    // In a real implementation, this would send to a Bluetooth printer
    // For now, we'll return the chit content and success status
    const printResult = {
      success: true,
      message: 'Kitchen chit generated successfully',
      chitContent,
      orderId: order.id,
      orderNumber: order.orderNumber,
      tableNumber: order.tableNumber,
      timestamp: new Date().toISOString(),
    };

    // Log the print attempt
    console.log(`Kitchen chit printed for order ${order.orderNumber}:`);
    console.log(chitContent);

    return NextResponse.json(printResult);
  } catch (error) {
    console.error('Error printing kitchen chit:', error);
    return NextResponse.json(
      { error: 'Failed to print kitchen chit' },
      { status: 500 }
    );
  }
}

// Generate kitchen chit content in ESC/POS format
function generateKitchenChitContent(order: any): string {
  const lines = [];
  
  // Header
  lines.push('================================');
  lines.push('         KITCHEN CHIT');
  lines.push('================================');
  lines.push('');
  
  // Order info
  lines.push(`TABLE: ${order.tableNumber}`);
  lines.push(`ORDER: ${order.orderNumber}`);
  lines.push(`TIME: ${new Date(order.createdAt).toLocaleTimeString()}`);
  lines.push(`TYPE: ${order.orderType}`);
  lines.push('');
  lines.push('--------------------------------');
  lines.push('');
  
  // Items
  order.items.forEach((item: any) => {
    lines.push(`${item.quantity}x ${item.product.name}`);
    if (item.notes) {
      lines.push(`   * ${item.notes}`);
    }
    lines.push('');
  });
  
  // Order notes
  if (order.notes) {
    lines.push('--------------------------------');
    lines.push('ORDER NOTES:');
    lines.push(order.notes);
    lines.push('');
  }
  
  // Footer
  lines.push('--------------------------------');
  lines.push('      END OF ORDER');
  lines.push('================================');
  lines.push('');
  lines.push('');
  
  return lines.join('\n');
}

// Generate ESC/POS commands for Bluetooth printing
function generateESCPOSCommands(order: any): Uint8Array {
  const commands = [];
  
  // Initialize printer
  commands.push(0x1B, 0x40); // ESC @
  
  // Set alignment to center
  commands.push(0x1B, 0x61, 0x01); // ESC a 1
  
  // Header
  commands.push(...textToBytes('KITCHEN CHIT\n'));
  commands.push(...textToBytes('================================\n'));
  
  // Set alignment to left
  commands.push(0x1B, 0x61, 0x00); // ESC a 0
  
  // Order info
  commands.push(...textToBytes(`TABLE: ${order.tableNumber}\n`));
  commands.push(...textToBytes(`ORDER: ${order.orderNumber}\n`));
  commands.push(...textToBytes(`TIME: ${new Date(order.createdAt).toLocaleTimeString()}\n`));
  commands.push(...textToBytes(`TYPE: ${order.orderType}\n`));
  commands.push(...textToBytes('\n'));
  commands.push(...textToBytes('--------------------------------\n'));
  commands.push(...textToBytes('\n'));
  
  // Items
  order.items.forEach((item: any) => {
    const line = `${item.quantity}x ${item.product.name}`;
    commands.push(...textToBytes(line + '\n'));
    
    if (item.notes) {
      commands.push(...textToBytes(`  * ${item.notes}\n`));
    }
    commands.push(...textToBytes('\n'));
  });
  
  // Order notes
  if (order.notes) {
    commands.push(...textToBytes('--------------------------------\n'));
    commands.push(...textToBytes('ORDER NOTES:\n'));
    commands.push(...textToBytes(order.notes + '\n'));
    commands.push(...textToBytes('\n'));
  }
  
  // Footer
  commands.push(...textToBytes('--------------------------------\n'));
  commands.push(...textToBytes('      END OF ORDER\n'));
  commands.push(...textToBytes('================================\n'));
  commands.push(...textToBytes('\n'));
  commands.push(...textToBytes('\n'));
  
  // Cut paper
  commands.push(0x1D, 0x56, 0x42, 0x00); // GS V B 0
  
  return new Uint8Array(commands);
}

// Helper function to convert text to bytes
function textToBytes(text: string): number[] {
  return Array.from(text, char => char.charCodeAt(0));
}