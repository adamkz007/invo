import { z } from 'zod';

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: z.string().optional().or(z.literal('')),
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  quantity: z.coerce.number().min(0, 'Quantity must be a positive number'),
  sku: z.string().min(3, 'SKU must be at least 3 characters').optional().or(z.literal('')),
  disableStockManagement: z.boolean().optional().default(false),
  imageUrl: z.string().optional().or(z.literal('')),
});

export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
