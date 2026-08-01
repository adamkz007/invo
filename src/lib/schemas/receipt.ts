import { z } from 'zod';

export const receiptItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().optional(),
});

export const createReceiptSchema = z.object({
  receiptNumber: z.string().optional(),
  customerName: z.string().optional(),
  customerPhone: z.string().optional().nullable(),
  receiptDate: z.coerce.date().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'OTHER', 'BANK']).optional().default('CASH'),
  notes: z.string().optional().nullable(),
  total: z.coerce.number().min(0).optional(),
  items: z.array(receiptItemSchema).min(1, 'Add at least one item'),
});

export const receiptCreateSchema = createReceiptSchema;

export type CreateReceiptInput = z.infer<typeof createReceiptSchema>;
