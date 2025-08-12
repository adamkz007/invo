/**
 * WhatsApp Web API utilities for generating links with pre-filled messages
 * Uses the format: https://api.whatsapp.com/send?phone={number}&text={encoded_message}
 */

import { formatCurrency } from './utils';

// Types for WhatsApp message data
export interface WhatsAppInvoiceData {
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  companyName?: string;
  currency?: string;
}

export interface WhatsAppReceiptData {
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
  companyName?: string;
  currency?: string;
}

export interface WhatsAppFollowUpData {
  customerName: string;
  invoiceNumber: string;
  totalAmount: number;
  dueDate: string;
  daysOverdue: number;
  companyName?: string;
  currency?: string;
}

export interface WhatsAppCustomerData {
  customerName: string;
  companyName?: string;
}

/**
 * Format phone number to international format (remove spaces, dashes, and ensure proper format)
 * @param phoneNumber - Raw phone number
 * @returns Formatted phone number without + prefix
 */
export function formatPhoneNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-numeric characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // Remove + prefix if present
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  
  // If number starts with 0, assume it's Malaysian and add country code
  if (cleaned.startsWith('0')) {
    cleaned = '60' + cleaned.substring(1);
  }
  
  // If number doesn't start with country code and is 10-11 digits, assume Malaysian
  if (cleaned.length >= 10 && cleaned.length <= 11 && !cleaned.startsWith('60')) {
    cleaned = '60' + cleaned;
  }
  
  return cleaned;
}

/**
 * Generate WhatsApp message for invoice
 */
export function generateInvoiceMessage(data: WhatsAppInvoiceData): string {
  const { customerName, invoiceNumber, totalAmount, dueDate, companyName = 'Our Company', currency = 'RM' } = data;
  
  return `Hello ${customerName}! 👋\n\n` +
    `Your invoice ${invoiceNumber} from ${companyName} is ready.\n\n` +
    `💰 Total Amount: ${formatCurrency(totalAmount, { currency })}\n` +
    `📅 Due Date: ${dueDate}\n\n` +
    `Please review the invoice details and arrange payment by the due date.\n\n` +
    `Thank you for your business! 🙏`;
}

/**
 * Generate WhatsApp message for receipt
 */
export function generateReceiptMessage(data: WhatsAppReceiptData): string {
  const { customerName, invoiceNumber, totalAmount, companyName = 'Our Company', currency = 'RM' } = data;
  
  return `Hello ${customerName}! 👋\n\n` +
    `Thank you for your payment! ✅\n\n` +
    `📄 Invoice: ${invoiceNumber}\n` +
    `💰 Amount Paid: ${formatCurrency(totalAmount, { currency })}\n` +
    `🏢 From: ${companyName}\n\n` +
    `Your payment has been received and processed successfully.\n\n` +
    `We appreciate your business! 🙏`;
}

/**
 * Generate WhatsApp message for follow-up (gentle reminder)
 */
export function generateFollowUpMessage(data: WhatsAppFollowUpData, type: 'gentle' | 'urgent' | 'final' = 'gentle'): string {
  const { customerName, invoiceNumber, totalAmount, dueDate, daysOverdue, companyName = 'Our Company', currency = 'RM' } = data;
  
  switch (type) {
    case 'gentle':
      return `Hello ${customerName}! 👋\n\n` +
        `This is a friendly reminder about invoice ${invoiceNumber}.\n\n` +
        `💰 Amount: ${formatCurrency(totalAmount, { currency })}\n` +
        `📅 Due Date: ${dueDate}\n` +
        `⏰ Days Overdue: ${daysOverdue}\n\n` +
        `We understand that sometimes payments can be delayed. If you need any assistance or have questions, please let us know.\n\n` +
        `Thank you for your attention to this matter! 🙏`;
    
    case 'urgent':
      return `Hello ${customerName}! ⚠️\n\n` +
        `URGENT: Invoice ${invoiceNumber} is now ${daysOverdue} days overdue.\n\n` +
        `💰 Outstanding Amount: ${formatCurrency(totalAmount, { currency })}\n` +
        `📅 Original Due Date: ${dueDate}\n\n` +
        `Please arrange payment as soon as possible to avoid any service interruption.\n\n` +
        `Contact us immediately if you need to discuss payment arrangements.`;
    
    case 'final':
      return `Hello ${customerName}! 🚨\n\n` +
        `FINAL NOTICE: Invoice ${invoiceNumber} is ${daysOverdue} days overdue.\n\n` +
        `💰 Outstanding Amount: ${formatCurrency(totalAmount, { currency })}\n` +
        `📅 Original Due Date: ${dueDate}\n\n` +
        `This is our final reminder before further action is taken. Please contact us immediately to resolve this matter.\n\n` +
        `Immediate payment or contact is required.`;
    
    default:
      return generateFollowUpMessage(data, 'gentle');
  }
}

/**
 * Generate WhatsApp message for general customer contact
 */
export function generateCustomerMessage(data: WhatsAppCustomerData, customMessage?: string): string {
  const { customerName, companyName = 'Our Company' } = data;
  
  if (customMessage) {
    return `Hello ${customerName}! 👋\n\n${customMessage}\n\nBest regards,\n${companyName}`;
  }
  
  return `Hello ${customerName}! 👋\n\n` +
    `Greetings from ${companyName}!\n\n` +
    `We hope you're doing well. Please let us know if you need any assistance.\n\n` +
    `Thank you for being our valued customer! 🙏`;
}

/**
 * Generate WhatsApp web URL with pre-filled message
 * @param phoneNumber - Customer phone number
 * @param message - Pre-filled message text
 * @returns WhatsApp web URL
 */
export function generateWhatsAppURL(phoneNumber: string, message: string): string {
  const formattedPhone = formatPhoneNumber(phoneNumber);
  const encodedMessage = encodeURIComponent(message);
  
  return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
}

/**
 * Generate WhatsApp URL for invoice
 */
export function generateInvoiceWhatsAppURL(phoneNumber: string, data: WhatsAppInvoiceData): string {
  const message = generateInvoiceMessage(data);
  return generateWhatsAppURL(phoneNumber, message);
}

/**
 * Generate WhatsApp URL for receipt
 */
export function generateReceiptWhatsAppURL(phoneNumber: string, data: WhatsAppReceiptData): string {
  const message = generateReceiptMessage(data);
  return generateWhatsAppURL(phoneNumber, message);
}

/**
 * Generate WhatsApp URL for follow-up
 */
export function generateFollowUpWhatsAppURL(
  phoneNumber: string, 
  data: WhatsAppFollowUpData, 
  type: 'gentle' | 'urgent' | 'final' = 'gentle'
): string {
  const message = generateFollowUpMessage(data, type);
  return generateWhatsAppURL(phoneNumber, message);
}

/**
 * Generate WhatsApp URL for customer contact
 */
export function generateCustomerWhatsAppURL(
  phoneNumber: string, 
  data: WhatsAppCustomerData, 
  customMessage?: string
): string {
  const message = generateCustomerMessage(data, customMessage);
  return generateWhatsAppURL(phoneNumber, message);
}

/**
 * Validate if phone number is valid for WhatsApp
 * @param phoneNumber - Phone number to validate
 * @returns boolean indicating if phone number is valid
 */
export function isValidWhatsAppNumber(phoneNumber: string): boolean {
  if (!phoneNumber) return false;
  
  const formatted = formatPhoneNumber(phoneNumber);
  
  // Check if it's a valid international number (at least 10 digits)
  return /^\d{10,15}$/.test(formatted);
}

/**
 * Get WhatsApp display text for phone number
 * @param phoneNumber - Raw phone number
 * @returns Formatted display text
 */
export function getWhatsAppDisplayNumber(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  const formatted = formatPhoneNumber(phoneNumber);
  
  // Add + prefix for display
  return `+${formatted}`;
}