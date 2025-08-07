import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Products will be fetched from the database in a real implementation

// Function to get products - in a real app this would fetch from database
async function getProducts() {
  // In a real implementation, this would be:
  // return await prisma.product.findMany();
  return [];
}

// Import Prisma client for database operations
import { prisma } from '@/lib/prisma';

// Function to get a valid user ID from the database
async function getValidUserId() {
  const users = await prisma.user.findMany({ take: 1 });
  if (users.length === 0) {
    throw new Error('No users found in the database');
  }
  return users[0].id;
}

// For backward compatibility, we'll keep the in-memory storage
// but primarily use the database for persistence
declare global {
  var _receipts: any[] | undefined;
}

// Initialize global receipts array if it doesn't exist
if (!global._receipts) {
  global._receipts = [];
}

// Export the global receipts array for backward compatibility
export const receipts = global._receipts;

/**
 * GET /api/receipts
 * Get all receipts from the database
 */
export async function GET(request: Request) {
  // Since we can't access localStorage from the server,
  // we need to rely on a different approach
  
  // Check for a custom header that the client can send to indicate module status
  const headers = new Headers(request.headers);
  const moduleEnabled = headers.get('x-receipts-module-enabled');
  
  // If the header explicitly says the module is disabled, return empty array
  if (moduleEnabled === 'false') {
    return NextResponse.json([]);
  }
  
  // Check for invoice ID query parameter
  const url = new URL(request.url);
  const invoiceId = url.searchParams.get('invoiceId');
  
  try {
    // Fetch receipts from the database with their items and related product information
    const dbReceipts = await prisma.receipt.findMany({
      include: {
        items: {
          include: {
            product: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    // Filter by invoice ID if provided (check notes field for invoice reference)
    let filteredReceipts = dbReceipts;
    if (invoiceId) {
      filteredReceipts = dbReceipts.filter(receipt => 
        receipt.notes?.includes(`Invoice ${invoiceId}`) || 
        receipt.notes?.includes(`Payment for Invoice INV-${invoiceId}`)
      );
    }
    
    // For backward compatibility, update the in-memory array
    global._receipts = dbReceipts;
    
    return NextResponse.json(filteredReceipts);
  } catch (error) {
    console.error('Error fetching receipts from database:', error);
    // Fallback to in-memory receipts if database query fails
    return NextResponse.json(receipts);
  }
}

/**
 * POST /api/receipts
 * Create a new receipt in the database
 */
export async function POST(request: Request) {
  try {
    // Check for module status header
    const headers = new Headers(request.headers);
    const moduleEnabled = headers.get('x-receipts-module-enabled');
    
    // If the header explicitly says the module is disabled, return error
    if (moduleEnabled === 'false') {
      return NextResponse.json(
        { error: 'Receipts module is disabled' },
        { status: 403 }
      );
    }
    
    const data = await request.json();
    
    // Generate a receipt number with "RCT-" prefix and 6 random alphanumeric characters
    const receiptNumber = `RCT-${nanoid(6).toUpperCase()}`;
    
    // Default to 'Walk-in Customer' if no customer name provided
    const customerName = data.customerName || 'Walk-in Customer';
    
    // Create the receipt in the database using Prisma transaction
    const newReceipt = await prisma.$transaction(async (tx) => {
      // Create the receipt record
      const receipt = await tx.receipt.create({
        data: {
          receiptNumber,
          customerName,
          customerPhone: data.customerPhone || null,
          receiptDate: data.receiptDate ? new Date(data.receiptDate) : new Date(), // Default to current date if not provided
          paymentMethod: data.paymentMethod,
          notes: data.notes || '',
          total: data.total,
          userId: data.userId || await getValidUserId(), // Get a valid user ID from the database
          // We don't store invoiceId and orderNumber in the database schema,
          // but we'll include them in the response for backward compatibility
        },
      });
      
      // Create receipt items
      const items = await Promise.all(
        data.items.map(async (item: any) => {
          // Create the receipt item
          const receiptItem = await tx.receiptItem.create({
            data: {
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              description: item.description || '',
              receiptId: receipt.id,
              productId: item.productId,
            },
            include: {
              product: true,
            },
          });
          
          return receiptItem;
        })
      );
      
      // Return the complete receipt with items
      return {
        ...receipt,
        items,
        // Add these fields for backward compatibility
        invoiceId: data.invoiceId || null,
        orderNumber: data.orderNumber || null,
      };
    });
    
    // For backward compatibility, also add to in-memory array
    receipts.unshift(newReceipt);
    
    return NextResponse.json(newReceipt);
  } catch (error) {
    console.error('Failed to create receipt:', error);
    return NextResponse.json(
      { error: 'Failed to create receipt' },
      { status: 500 }
    );
  }
}