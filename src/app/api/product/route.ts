import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

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
    // Get authenticated user from request
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Fetch products for this user with retry logic
    const products = await retryDatabaseOperation(() => 
      prisma.product.findMany({
        where: {
          userId: user.id
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    );
    
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch products' 
    }, { 
      status: 500 
    });
  }
} 