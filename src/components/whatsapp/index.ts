// WhatsApp component exports
export {
  WhatsAppButton,
  WhatsAppInvoiceButton,
  WhatsAppReceiptButton,
  WhatsAppFollowUpButton,
  WhatsAppContactButton
} from './whatsapp-button';

export {
  WhatsAppStatus,
  WhatsAppMessageItem,
  WhatsAppMessageHistory,
  type WhatsAppMessageStatus
} from './whatsapp-status';

// Re-export WhatsApp utilities for convenience
export {
  formatPhoneNumber,
  generateInvoiceMessage,
  generateReceiptMessage,
  generateFollowUpMessage,
  generateCustomerMessage,
  generateWhatsAppURL,
  generateInvoiceWhatsAppURL,
  generateReceiptWhatsAppURL,
  generateFollowUpWhatsAppURL,
  generateCustomerWhatsAppURL,
  isValidWhatsAppNumber,
  getWhatsAppDisplayNumber,
  type WhatsAppInvoiceData,
  type WhatsAppReceiptData,
  type WhatsAppFollowUpData,
  type WhatsAppCustomerData
} from '@/lib/whatsapp';