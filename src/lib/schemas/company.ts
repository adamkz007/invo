import { z } from 'zod';

export const companySchema = z.object({
  legalName: z.string().min(1, 'Legal business name is required'),
  ownerName: z.string().min(1, 'Owner name is required'),
  registrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  phoneNumber: z.string().optional(),
  addressLine1: z.string().min(1, 'Address line 1 is required').optional(),
  street: z.string().optional(),
  postcode: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional().default('Malaysia'),
  termsAndConditions: z.string().optional(),
  paymentMethod: z.enum(['bank', 'qr']).optional(),
  bankAccountName: z.string().optional(),
  bankName: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  qrImageUrl: z.string().optional(),
  msicCode: z.string().optional(),
});

export type CompanyInput = z.infer<typeof companySchema>;
