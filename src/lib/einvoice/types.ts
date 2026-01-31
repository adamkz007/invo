/**
 * E-Invoice Types for LHDN MyInvois and PEPPOL
 */

// Environment types
export type EInvoiceEnvironment = 'SANDBOX' | 'PRODUCTION';
export type EInvoiceProfile = 'LHDN' | 'PEPPOL';
export type EInvoiceStatus = 'PENDING' | 'SUBMITTED' | 'VALID' | 'INVALID' | 'CANCELLED';

// Document types supported by LHDN MyInvois
export type EInvoiceDocumentType =
  | 'INVOICE'
  | 'CREDIT_NOTE'
  | 'DEBIT_NOTE'
  | 'REFUND_NOTE'
  | 'SELF_BILLED_INVOICE'
  | 'SELF_BILLED_CREDIT_NOTE'
  | 'SELF_BILLED_DEBIT_NOTE'
  | 'SELF_BILLED_REFUND_NOTE';

// Validation error/warning
export interface ValidationIssue {
  field: string;
  message: string;
  category: 'config' | 'supplier' | 'buyer' | 'invoice' | 'items' | 'tax';
  severity: 'error' | 'warning';
  code?: string;
}

// Validation result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationIssue[];
  warnings: ValidationIssue[];
  summary: {
    totalErrors: number;
    totalWarnings: number;
    byCategory: Record<string, number>;
  };
}

// Supplier (Seller) party information for e-invoice
export interface EInvoiceSupplier {
  tin: string; // Tax Identification Number
  brn?: string; // Business Registration Number
  sstNumber?: string; // SST Registration Number
  ttxNumber?: string; // Tourism Tax Number
  legalName: string;
  tradingName?: string;
  address: {
    street: string;
    city: string;
    postcode: string;
    state?: string;
    country: string; // ISO 3166-1 alpha-2
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  msicCode?: string; // Malaysian Standard Industrial Classification
  // PEPPOL specific
  peppolId?: string;
  peppolScheme?: string;
}

// Buyer party information for e-invoice
export interface EInvoiceBuyer {
  tin?: string; // Tax Identification Number (required for B2B)
  brn?: string; // Business Registration Number
  idType?: string; // e.g., NRIC, PASSPORT, BRN, ARMY
  idValue?: string;
  name: string;
  address?: {
    street?: string;
    city?: string;
    postcode?: string;
    state?: string;
    country?: string;
  };
  contact?: {
    phone?: string;
    email?: string;
  };
  // PEPPOL specific
  peppolId?: string;
  peppolScheme?: string;
}

// Invoice line item for e-invoice
export interface EInvoiceLineItem {
  lineNumber: number;
  productName: string;
  productDescription?: string;
  quantity: number;
  unitCode: string; // UNECE Rec 20 unit code
  unitPrice: number;
  lineNetAmount: number;
  taxCategory: string; // Tax type code
  taxRate: number;
  taxAmount: number;
  taxExemptionReasonCode?: string;
  taxExemptionReason?: string;
  classificationCode?: string; // Product classification
  classificationScheme?: string;
}

// Tax subtotal for a specific tax category
export interface TaxSubtotal {
  taxableAmount: number;
  taxAmount: number;
  taxCategory: string;
  taxRate: number;
  taxExemptionReasonCode?: string;
  taxExemptionReason?: string;
}

// Full e-invoice document data (canonical model)
export interface EInvoiceData {
  // Document identification
  documentType: EInvoiceDocumentType;
  documentVersion: string;
  invoiceNumber: string;
  issueDate: string; // ISO 8601 date
  issueTime?: string; // ISO 8601 time
  dueDate?: string;

  // Currency
  currencyCode: string; // ISO 4217
  exchangeRate?: number; // Required if currency != MYR

  // Parties
  supplier: EInvoiceSupplier;
  buyer: EInvoiceBuyer;

  // Line items
  items: EInvoiceLineItem[];

  // Totals
  lineExtensionAmount: number; // Sum of line net amounts
  taxExclusiveAmount: number;
  taxInclusiveAmount: number;
  allowanceTotalAmount?: number;
  chargeTotalAmount?: number;
  payableAmount: number;

  // Tax breakdown
  taxSubtotals: TaxSubtotal[];
  totalTaxAmount: number;

  // Payment information
  paymentMeans?: {
    code: string; // Payment means code
    financialAccountId?: string;
    financialAccountName?: string;
  };
  paymentTerms?: string;

  // Notes
  notes?: string[];

  // References
  originalInvoiceRef?: string; // For credit/debit notes

  // Metadata
  internalId?: string; // Invo invoice ID
}

// MyInvois API response types
export interface MyInvoisSubmissionResponse {
  submissionUid: string;
  acceptedDocuments?: {
    uuid: string;
    invoiceCodeNumber: string;
  }[];
  rejectedDocuments?: {
    invoiceCodeNumber: string;
    error: {
      code: string;
      message: string;
      target?: string;
      propertyPath?: string;
    };
  }[];
}

export interface MyInvoisDocumentStatus {
  uuid: string;
  submissionUid: string;
  longId?: string;
  internalId?: string;
  typeName: string;
  typeVersionName: string;
  issuerTin: string;
  issuerName: string;
  receiverId?: string;
  receiverName?: string;
  dateTimeIssued: string;
  dateTimeReceived: string;
  dateTimeValidated?: string;
  totalSales?: number;
  totalDiscount?: number;
  netAmount?: number;
  total?: number;
  status: 'Submitted' | 'Valid' | 'Invalid' | 'Cancelled';
  cancelDateTime?: string;
  rejectRequestDateTime?: string;
  documentStatusReason?: string;
  createdByUserId?: string;
  validationResults?: {
    status: string;
    validationSteps: {
      status: string;
      name: string;
      error?: {
        code: string;
        message: string;
        target?: string;
        propertyPath?: string;
      };
    }[];
  };
}

// Configuration types
export interface EInvoiceConfig {
  enabled: boolean;
  environment: EInvoiceEnvironment;
  myinvoisClientId?: string;
  supplierTin?: string;
  supplierBrn?: string;
  sstRegistrationNumber?: string;
  tourismTaxNumber?: string;
  defaultCurrencyCode: string;
  autoSubmitOnSend: boolean;
  peppolParticipantId?: string;
  peppolSchemeId?: string;
}
