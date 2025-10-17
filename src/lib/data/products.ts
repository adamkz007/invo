import { prisma } from '@/lib/prisma';
import { toNumber } from '@/lib/decimal';
import type { ProductSummary } from '@/types';

export async function getProductsForUser(userId: string): Promise<ProductSummary[]> {
  const products = await prisma.product.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: toNumber(product.price),
    quantity: product.quantity,
    sku: product.sku,
    disableStockManagement: product.disableStockManagement,
  }));
}
