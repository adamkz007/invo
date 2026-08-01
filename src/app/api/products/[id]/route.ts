import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { productSchema, updateProductSchema } from '@/lib/schemas/product';
import { safeErrorResponse } from '@/lib/api-error';

const PRODUCT_TAG = (userId: string) => `products:${userId}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = await Promise.resolve(params.id);
    
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Find the product by ID and ensure it belongs to the user
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: userId
      }
    });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch product' 
    }, { 
      status: 500 
    });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = await Promise.resolve(params.id);
    const productData = productSchema.parse(await request.json());

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Check if the product exists and belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: userId
      }
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Update the product
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: {
        name: productData.name,
        description: productData.description,
        price: productData.price,
        quantity: productData.quantity,
        sku: productData.sku,
        disableStockManagement: productData.disableStockManagement,
        imageUrl: productData.imageUrl,
        userId // Ensure the userId remains the same
      }
    });
    
    revalidateTag(PRODUCT_TAG(userId));
    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update product');
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = await Promise.resolve(params.id);

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Check if the product exists and belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: userId
      }
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Delete the product
    const deletedProduct = await prisma.product.delete({
      where: {
        id: productId
      }
    });
    
    revalidateTag(PRODUCT_TAG(userId));
    return NextResponse.json({ message: 'Product deleted successfully', product: deletedProduct });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to delete product');
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = await Promise.resolve(params.id);
    let productData: z.infer<typeof updateProductSchema>;
    try {
      productData = updateProductSchema.parse(await request.json());
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validation error', details: error.errors },
          { status: 400 },
        );
      }
      throw error;
    }

    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;

    // Check if the product exists and belongs to the user
    const existingProduct = await prisma.product.findFirst({
      where: {
        id: productId,
        userId: userId
      }
    });
    
    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    
    // Extract only the fields we want to update
    const { price, quantity, disableStockManagement, imageUrl } = productData;

    // Create an update data object with only the fields that are provided
    const updateData: any = {};

    if (price !== undefined) updateData.price = price;
    if (quantity !== undefined) updateData.quantity = quantity;
    if (disableStockManagement !== undefined) updateData.disableStockManagement = disableStockManagement;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    
    // Update the product with only the fields that are provided
    const updatedProduct = await prisma.product.update({
      where: {
        id: productId
      },
      data: updateData
    });
    
    return NextResponse.json({ product: updatedProduct });
  } catch (error) {
    return safeErrorResponse(error, 'Failed to update product');
  }
}
