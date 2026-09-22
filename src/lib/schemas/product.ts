import { z } from 'zod';

const optionalNullableString = z
  .union([z.string(), z.literal(''), z.null()])
  .optional();

const optionalSku = z
  .union([
    z.string().min(3, 'SKU must be at least 3 characters'),
    z.literal(''),
    z.null(),
  ])
  .optional();

export const productSchema = z.object({
  name: z.string().min(2, 'Product name must be at least 2 characters'),
  description: optionalNullableString,
  price: z.coerce.number().min(0, 'Price must be a positive number'),
  quantity: z.coerce.number().min(0, 'Quantity must be a positive number'),
  sku: optionalSku,
  disableStockManagement: z.boolean().optional().default(false),
  imageUrl: optionalNullableString,
});

export const updateProductSchema = productSchema.partial();

export type ProductInput = z.infer<typeof productSchema>;
