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

export interface ProductSummary {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  quantity: number;
  sku?: string | null;
  disableStockManagement: boolean;
  imageUrl?: string | null;
}

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
  street?: string;
  city?: string;
  postcode?: string;
  state?: string;
  country?: string;
  registrationType?: 'NRIC' | 'BRN' | 'Passport';
  registrationNumber?: string;
  taxIdentificationNumber?: string;
  notes?: string;
}

export interface ProductFormValues {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  sku?: string;
  disableStockManagement?: boolean;
  imageUrl?: string | null;
}

export interface InvoiceItemFormValues {
  productId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
  disableStockManagement: boolean;
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
  street?: string;
  city?: string;
  postcode?: string;
  state?: string;
  country?: string;
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
  imageUrl?: string | null;
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
    street: string | null;
    city: string | null;
    postcode: string | null;
    state: string | null;
    country: string | null;
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

// Receipt specific types
export interface ReceiptFormValues {
  customerPhone?: string;
  customerName?: string;
  receiptDate: Date;
  items: ReceiptItemFormValues[];
  paymentMethod: 'CASH' | 'CARD' | 'OTHER';
  notes?: string;
  userId?: string;
}

export interface ReceiptItemFormValues {
  productId: string;
  quantity: number;
  unitPrice: number;
  description?: string;
}

export interface ReceiptWithDetails {
  id: string;
  receiptNumber: string;
  customerPhone?: string;
  customerName: string;
  receiptDate: Date;
  total: number;
  paymentMethod: string;
  notes?: string;
  items: InvoiceItemWithDetails[];
  createdAt: Date;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  publishedAt: string;
  updatedAt: string;
  author: string;
  readTime: string;
  image: string;
  imageAlt?: string;
  featured?: boolean;
  tags?: string[];
}
