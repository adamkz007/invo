import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
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
    
    // Find products for this user
    const products = await prisma.product.findMany({
      where: {
        userId: userId
      },
      orderBy: {
        name: 'asc'
      }
    });

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

export async function POST(request: NextRequest) {
  try {
    const productData = await request.json();
    
    // Get auth token from cookies
    const token = request.cookies.get('auth_token')?.value;
    
    // Use the provided user ID or default to a demo user ID if no token is found
    let userId = productData.userId || '1'; // Default user ID for demo purposes
    
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
    
    // Extract the fields we need for product creation
    const {
      name,
      description,
      price,
      quantity,
      sku,
      disableStockManagement = false, // Default to false if not provided
    } = productData;
    
    // Create product using Prisma with explicit fields
    const newProduct = await prisma.product.create({
      data: {
        name,
        description,
        price,
        quantity,
        sku,
        disableStockManagement,
        userId
      }
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: `Failed to create product: ${error.message}` 
      }, { 
        status: 500 
      });
    }
    
    return NextResponse.json({ 
      error: 'Failed to create product' 
    }, { 
      status: 500 
    });
  }
} 