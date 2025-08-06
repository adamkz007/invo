import { NextResponse } from 'next/server';
import { mockReceipts, receipts } from '../route';

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

/**
 * GET /api/receipts/[id] - Get a single receipt by ID
 * 
 * Note: The database schema has been updated with Receipt and ReceiptItem models,
 * but this API implementation is using mock data for simplicity.
 * In a production environment, this would use Prisma to query the database.
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
    
    // Get the receipt ID from the route parameters
    const { id } = context.params;
    
    // Find the receipt with the given ID from all receipts (both mock and created)
    const receipt = receipts.find((r: Receipt) => r.id === id);
    
    if (!receipt) {
      console.log(`Receipt with ID ${id} not found`);
      return NextResponse.json(
        { error: 'Receipt not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(receipt);
  } catch (error) {
    console.error('Error fetching receipt:', error);
    return NextResponse.json(
      { error: 'Failed to fetch receipt' },
      { status: 500 }
    );
  }
}