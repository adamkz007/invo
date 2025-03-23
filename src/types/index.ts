import { User, Customer, Product, Invoice, InvoiceItem } from "@prisma/client";

// Define InvoiceStatus enum locally
export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED'
}

// Extended types with relations
export type UserWithRelations = User & {
  customers?: Customer[];
  inventory?: Product[];
  invoices?: Invoice[];
};

export type CustomerWithRelations = Customer & {
  invoices?: Invoice[];
};

export type ProductWithRelations = Product & {
  invoiceItems?: InvoiceItem[];
  disableStockManagement: boolean;
};

export type InvoiceWithRelations = Invoice & {
  customer: Customer;
  items: InvoiceItemWithRelations[];
};

export type InvoiceItemWithRelations = InvoiceItem & {
  product: Product;
};

// Form types
export interface LoginFormValues {
  phoneNumber: string;
  tac: string;
}

export interface RequestTACFormValues {
  phoneNumber: string;
}

export interface SignUpFormValues {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface CustomerFormValues {
  name: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  disableStockManagement?: boolean;
}

export interface InvoiceItemFormValues {
  productId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  disableStockManagement?: boolean;
}

export interface InvoiceFormValues {
  customerId: string;
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  taxRate: number;
  discountRate: number;
  notes?: string;
  items: InvoiceItemFormValues[];
  paidAmount?: number;
  userId?: string;
}

// Auth types
export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Additional types
export interface CustomerWithDetails {
  id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface ProductWithDetails {
  id: string;
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export interface InvoiceItemWithDetails {
  id: string;
  product: {
    name: string;
    description?: string;
  };
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface InvoiceWithDetails {
  id: string;
  invoiceNumber: string;
  customer: {
    id: string;
    name: string;
    email: string | null;
    phoneNumber: string | null;
    address: string | null;
  };
  issueDate: Date;
  dueDate: Date;
  status: InvoiceStatus;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  total: number;
  paidAmount: number;
  notes?: string;
  items: InvoiceItemWithDetails[];
}
