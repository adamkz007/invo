import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from "date-fns";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import * as crypto from 'crypto';

// For combining class names
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Settings interface
export interface AppSettings {
  currency: {
    code: string;
    locale: string;
  };
  enableReceiptsModule: boolean;
}

// Default settings
export const defaultSettings: AppSettings = {
  currency: {
    code: 'MYR',
    locale: 'en-MY'
  },
  enableReceiptsModule: false
};

// Format currency
export function formatCurrency(value: number, settings: AppSettings = defaultSettings) {
  return new Intl.NumberFormat(settings.currency.locale, {
    style: 'currency',
    currency: settings.currency.code
  }).format(value);
}

// Format dates
export function format(date: Date | undefined, formatString: string) {
  return date ? dateFnsFormat(date, formatString) : '';
}

/**
 * Format a date or string into a relative time format (e.g., "2 days ago")
 */
export function formatRelativeDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }
  
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

// Generate a random 6-digit code for TAC (Time-based Authentication Code)
export function generateTAC(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Generate invoice number (format: INV-{sequential number}-{timestamp})
export function generateInvoiceNumber(userId: string): string {
  // In a real implementation, we would fetch the latest invoice number
  // from the database and increment it. For this utility function,
  // we'll use a timestamp-based approach for demonstration.
  
  // Use the last 4 digits of the timestamp for the suffix
  const timestamp = Date.now().toString().slice(-4);
  
  // For demonstration, we'll use a random 4-digit number
  // In a real implementation, this would be fetched from the database
  const sequentialNumber = Math.floor(1000 + Math.random() * 9000);
  
  return `INV-${sequentialNumber.toString().padStart(4, '0')}-${timestamp}`;
}

// Calculate invoice totals
export function calculateInvoiceTotals(
  items: { quantity: number; unitPrice: number }[],
  taxRate: number = 0,
  discountRate: number = 0
) {
  const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const taxAmount = subtotal * (taxRate / 100);
  const discountAmount = subtotal * (discountRate / 100);
  const total = subtotal + taxAmount - discountAmount;

  return {
    subtotal,
    taxAmount,
    discountAmount,
    total,
  };
}

/**
 * Calculate the number of days between now and a due date
 * Returns a positive number for future dates (days remaining)
 * Returns a negative number for past dates (days overdue)
 */
export function calculateDueDays(dueDate: Date | string): number {
  const dueDateObj = typeof dueDate === 'string' ? new Date(dueDate) : dueDate;
  
  if (isNaN(dueDateObj.getTime())) {
    return 0;
  }
  
  const now = new Date();
  const diffTime = dueDateObj.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}
