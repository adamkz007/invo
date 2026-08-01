import { z } from 'zod';
import { isValidMalaysiaPhoneNumber } from '@/lib/phone';

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phoneNumber: z
    .string()
    .min(4, 'Phone number is required')
    .refine((val) => isValidMalaysiaPhoneNumber(val), {
      message: 'Please enter a valid Malaysian phone number',
    }),
  street: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  registrationType: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxIdentificationNumber: z.string().optional(),
  notes: z.string().optional().or(z.literal('')),
  tin: z.string().optional(),
  brn: z.string().optional(),
  peppolParticipantId: z.string().optional(),
  peppolSchemeId: z.string().optional(),
});

export const updateCustomerSchema = customerSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field is required' },
);

export type CustomerInput = z.infer<typeof customerSchema>;

export const customerCreateSchema = customerSchema.pick({
  name: true,
  email: true,
  phoneNumber: true,
  notes: true,
});

export const customerUpdateSchema = customerSchema;
