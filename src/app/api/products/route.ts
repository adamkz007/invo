import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, unstable_cache } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

const PRODUCT_TAG = (userId: string) => `products:${userId}`;

type ProductListOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function parseQuery(req: NextRequest): ProductListOptions {
  const searchParams = req.nextUrl.searchParams;
  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const limitParam = Number(searchParams.get('limit'));
  const limit =
    Number.isFinite(limitParam) && limitParam > 0
      ? Math.min(Math.floor(limitParam), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
  const search = searchParams.get('search')?.trim() || undefined;
  return { page, limit, search };
}

const getProducts = (userId: string) =>
  unstable_cache(
    async (options: ProductListOptions) => {
      const page = options.page ?? 1;
      const limit = options.limit ?? DEFAULT_PAGE_SIZE;
      const skip = (page - 1) * limit;
      const where = {
        userId,
        ...(options.search
          ? {
              OR: [
                { name: { contains: options.search, mode: 'insensitive' } },
                { description: { contains: options.search, mode: 'insensitive' } },
                { sku: { contains: options.search, mode: 'insensitive' } },
              ],
            }
          : {}),
      };

      const [products, totalCount] = await Promise.all([
        prisma.product.findMany({
          where,
          orderBy: {
            createdAt: 'desc',
          },
          skip,
          take: limit,
        }),
        prisma.product.count({ where }),
      ]);

      const totalPages = Math.max(1, Math.ceil(totalCount / limit));

      return { data: products, totalCount, totalPages, page, pageSize: limit };
    },
    ['products', userId],
    {
      revalidate: 120,
      tags: [PRODUCT_TAG(userId)],
    },
  );

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id;
    const options = parseQuery(request);
    const products = await getProducts(userId)(options);

    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'private, max-age=0, s-maxage=120',
      }
    });
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
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const productData = await request.json();
    const userId = user.id;

    // Extract the fields we need for product creation
    const {
      name,
      description,
      price,
      quantity,
      sku,
      disableStockManagement = false, // Default to false if not provided
      imageUrl,
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
        imageUrl,
        userId
      }
    });

    // Invalidate cache for this user
    revalidateTag(PRODUCT_TAG(userId));

    return NextResponse.json({ product: newProduct }, { status: 201 });
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
