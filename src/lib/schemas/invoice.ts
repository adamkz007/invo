import { z } from 'zod';

export const invoiceItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.coerce.number().min(1, 'Quantity must be at least 1'),
  unitPrice: z.coerce.number().min(0.01, 'Price must be greater than 0'),
  description: z.string().optional(),
  disableStockManagement: z.boolean().optional(),
});

export const createInvoiceSchema = z.object({
  customerId: z.string().min(1, 'Customer is required'),
  issueDate: z.coerce.date().optional(),
  dueDate: z.coerce.date(),
  status: z
    .enum(['DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED'])
    .optional(),
  items: z.array(invoiceItemSchema).min(1, 'Add at least one item'),
  taxRate: z.coerce.number().min(0).max(100).optional().default(0),
  discountRate: z.coerce.number().min(0).optional().default(0),
  discountType: z.enum(['PERCENT', 'FIXED']).optional(),
  paidAmount: z.coerce.number().min(0).optional(),
  notes: z.string().optional(),
});

export const invoiceCreateSchema = createInvoiceSchema;

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
