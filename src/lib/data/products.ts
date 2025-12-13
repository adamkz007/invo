import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/decimal';
import type { ProductSummary } from '@/types';

type ProductListOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function getProductsForUser(
  userId: string,
  options: ProductListOptions = {},
): Promise<{
  data: ProductSummary[];
  totalCount: number;
  totalPages: number;
  page: number;
  pageSize: number;
}> {
  const page =
    options.page && Number.isFinite(options.page) && options.page > 0 ? Math.floor(options.page) : 1;
  const limit =
    options.limit && Number.isFinite(options.limit) && options.limit > 0
      ? Math.min(Math.floor(options.limit), MAX_PAGE_SIZE)
      : DEFAULT_PAGE_SIZE;
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / limit));

  return {
    data: products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: toNumber(product.price),
      quantity: product.quantity,
      sku: product.sku,
      disableStockManagement: product.disableStockManagement,
      imageUrl: product.imageUrl,
    })),
    totalCount,
    totalPages,
    page,
    pageSize: limit,
  };
}
