import { NextResponse } from 'next/server';
import { receipts } from '../route';

// Define a Receipt type to match the mock data structure
interface ReceiptItem {
  id: string;
  productId: string;
  product: {
    name: string;
    description: string;
  };
  quantity: number;
  unitPrice: number;
  description: string;
}

interface Receipt {
  id: string;
  receiptNumber: string;
  customerName: string;
  customerPhone: string | null;
  receiptDate: Date;
  paymentMethod: string;
  total: number;
  notes: string;
  items: ReceiptItem[];
  createdAt: Date;
}

// Import Prisma client for database operations
import { prisma } from '@/lib/prisma';

/**
 * GET /api/receipts/[id] - Get a single receipt by ID from the database
 */
export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    // Check for module status header
    const headers = new Headers(request.headers);
    const moduleEnabled = headers.get('x-receipts-module-enabled');
    
    // If the header explicitly says the module is disabled, return 404
    if (moduleEnabled === 'false') {
      return NextResponse.json(
        { error: 'Receipt not found or module disabled' },
        { status: 404 }
      );
    }
    
    // Get the receipt ID from the route parameters - using await to fix the warning
    const params = await context.params;
    const id = params.id;
    
    // Find the receipt with the given ID from the database
    const receipt = await prisma.receipt.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true
          }
        }
      }
    });
    
    if (!receipt) {
      // If not found in database, try the in-memory array as fallback
      const memoryReceipt = receipts.find((r: Receipt) => r.id === id);
      
      if (!memoryReceipt) {
        console.log(`Receipt with ID ${id} not found in database or memory`);
        return NextResponse.json(
          { error: 'Receipt not found' },
          { status: 404 }
        );
      }
      
      return NextResponse.json(memoryReceipt);
    }
    
    // Add any fields needed for backward compatibility
    const enhancedReceipt = {
      ...receipt,
      invoiceId: null, // These fields aren't in the database schema
      orderNumber: null // but might be expected by the client
    };
    
    return NextResponse.json(enhancedReceipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}