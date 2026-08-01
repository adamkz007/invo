import { prisma } from '@/lib/prisma';

type OrderItem = {
  productId: string;
  quantity: number;
  product: { disableStockManagement: boolean };
};

export async function decrementProductStock(items: OrderItem[], userId: string) {
  for (const item of items) {
    if (item.product.disableStockManagement) {
      continue;
    }

    const result = await prisma.product.updateMany({
      where: { id: item.productId, userId },
      data: { quantity: { decrement: item.quantity } },
    });

    if (result.count !== 1) {
      throw new Error(`Failed to update inventory for product ${item.productId}`);
    }
  }
}
