import { NextRequest, NextResponse } from 'next/server';
import { prisma, testConnection } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

// In-memory storage for products during development
let mockProductStorage: Record<string, any[]> = {
  // Default products for user ID '1'
  '1': [
    {
      id: 'mock-product-1',
      name: 'Web Development',
      description: 'Professional web development services',
      price: 1200.0,
      quantity: 10,
      disableStockManagement: false,
      userId: '1',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01')
    },
    {
      id: 'mock-product-2',
      name: 'Mobile App Development',
      description: 'Native mobile app development for iOS and Android',
      price: 2500.0,
      quantity: 5,
      disableStockManagement: false,
      userId: '1',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02')
    },
    {
      id: 'mock-product-3',
      name: 'UI/UX Design',
      description: 'User interface and experience design',
      price: 800.0,
      quantity: 15,
      disableStockManagement: false,
      userId: '1',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03')
    },
    {
      id: 'mock-product-4',
      name: 'SEO Service',
      description: 'Search engine optimization services',
      price: 500.0,
      quantity: 20,
      disableStockManagement: false,
      userId: '1',
      createdAt: new Date('2023-01-04'),
      updatedAt: new Date('2023-01-04')
    },
    {
      id: 'mock-product-5',
      name: 'Hosting (Monthly)',
      description: 'Web hosting services billed monthly',
      price: 25.0,
      quantity: 100,
      disableStockManagement: true,
      userId: '1',
      createdAt: new Date('2023-01-05'),
      updatedAt: new Date('2023-01-05')
    }
  ]
};

// Maximum number of database connection retries
const MAX_RETRIES = 5;

// Helper function to retry database operations
async function retryDatabaseOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0) {
      console.log(`Database operation failed, retrying... (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
      // Wait a bit before retrying, with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 500 * (MAX_RETRIES - retries + 1)));
      return retryDatabaseOperation(operation, retries - 1);
    }
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Test database connection first
    const isConnected = await testConnection().catch(() => false);
    
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
    
    // If database is connected, try to use it first
    if (isConnected) {
      try {
        // Fetch products for this user with retry logic
        const products = await retryDatabaseOperation(() => 
          prisma.product.findMany({
            where: {
              userId: userId
            },
            orderBy: {
              createdAt: 'desc'
            }
          })
        );
        
        return NextResponse.json(products);
      } catch (dbError) {
        console.error('Database error, falling back to mock storage:', dbError);
      }
    } else {
      console.log('Database not connected, using mock storage');
    }
    
    // Fall back to mock storage
    if (mockProductStorage[userId]) {
      return NextResponse.json(mockProductStorage[userId]);
    }
    
    return NextResponse.json([]);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products' 
    }, { 
      status: 500 
    });
  }
} 