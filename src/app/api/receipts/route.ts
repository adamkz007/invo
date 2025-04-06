import { NextResponse } from 'next/server';
import { nanoid } from 'nanoid';

// Mock products for the implementation
const mockProducts = [
  {
    id: 'prod_1',
    name: 'Pizza',
    description: 'Delicious cheese pizza',
    price: 12.99,
    quantity: 50
  },
  {
    id: 'prod_2',
    name: 'Burger',
    description: 'Classic beef burger',
    price: 8.99,
    quantity: 30
  },
  {
    id: 'prod_3',
    name: 'Fries',
    description: 'Crispy french fries',
    price: 3.99,
    quantity: 100
  },
  {
    id: 'prod_4',
    name: 'Cola',
    description: 'Refreshing soda',
    price: 1.99,
    quantity: 200
  }
];

// Function to get products - in a real app this would fetch from database
async function getProducts() {
  // In a real implementation, this would be:
  // return await prisma.product.findMany();
  return mockProducts;
}

// Mock data for receipts
export const mockReceipts = [
  {
    id: '1',
    receiptNumber: 'RCT-ABC123',
    customerName: 'Walk-in Customer',
    customerPhone: null,
    receiptDate: new Date('2023-04-15'),
    paymentMethod: 'CASH',
    total: 24.99,
    notes: 'First purchase',
    items: [
      {
        id: '101',
        productId: '1',
        product: { name: 'Coffee', description: 'Freshly brewed coffee' },
        quantity: 2,
        unitPrice: 4.99,
        description: ''
      },
      {
        id: '102',
        productId: '2',
        product: { name: 'Bagel', description: 'Fresh bagel with cream cheese' },
        quantity: 1,
        unitPrice: 15.01,
        description: 'With extra topping'
      }
    ],
    createdAt: new Date('2023-04-15')
  },
  {
    id: '2',
    receiptNumber: 'RCT-DEF456',
    customerName: 'John Doe',
    customerPhone: '+1234567890',
    receiptDate: new Date('2023-04-16'),
    paymentMethod: 'CARD',
    total: 35.50,
    notes: 'Regular customer',
    items: [
      {
        id: '103',
        productId: '3',
        product: { name: 'Sandwich', description: 'Club sandwich' },
        quantity: 1,
        unitPrice: 12.50,
        description: ''
      },
      {
        id: '104',
        productId: '4',
        product: { name: 'Soup', description: 'Soup of the day' },
        quantity: 1,
        unitPrice: 8.00,
        description: ''
      },
      {
        id: '105',
        productId: '5',
        product: { name: 'Coffee', description: 'Large coffee' },
        quantity: 2,
        unitPrice: 7.50,
        description: 'One with sugar, one without'
      }
    ],
    createdAt: new Date('2023-04-16')
  }
];

// In-memory storage for created receipts
// Use a global variable that persists across API calls
// This is a workaround for the development server reloading modules
declare global {
  var _receipts: any[] | undefined;
}

// Initialize global receipts array if it doesn't exist
if (!global._receipts) {
  global._receipts = [...mockReceipts];
}

// Export the global receipts array
export const receipts = global._receipts;

/**
 * GET /api/receipts
 * Get all receipts
 * 
 * Note: The database schema has been updated with Receipt and ReceiptItem models,
 * but this API implementation is using mock data for simplicity.
 * In a production environment, this would use Prisma to query the database.
 */
export async function GET() {
  return NextResponse.json(receipts);
}

/**
 * POST /api/receipts
 * Create a new receipt
 * 
 * Note: The database schema has been updated with Receipt and ReceiptItem models,
 * but this API implementation is using mock data for simplicity.
 * In a production environment, this would use Prisma to create records in the database.
 */
export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Generate a receipt number with "RCT-" prefix and 6 random alphanumeric characters
    const receiptNumber = `RCT-${nanoid(6).toUpperCase()}`;
    
    // Default to 'Walk-in Customer' if no customer name provided
    const customerName = data.customerName || 'Walk-in Customer';
    
    // Fetch product details to ensure we have the correct product names
    // Since we're using mock data, we need to make sure product info is correctly passed
    // Get the products array for product lookups
    const products = await getProducts();
    
    // Create a new receipt
    const newReceipt = {
      id: nanoid(),
      receiptNumber,
      customerName,
      customerPhone: data.customerPhone || null,
      receiptDate: new Date(data.receiptDate),
      paymentMethod: data.paymentMethod,
      notes: data.notes || '',
      total: data.total,
      items: data.items.map((item: any) => {
        // Find the product to get its name
        const product = products.find((p: any) => p.id === item.productId);
        return {
          id: nanoid(),
          productId: item.productId,
          product: { 
            name: product?.name || item.description || 'Unknown Product', 
            description: product?.description || item.description || '' 
          },
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          description: item.description || ''
        };
      }),
      createdAt: new Date(),
      userId: '1'
    };
    
    // Add to our in-memory receipts array (using the global reference)
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