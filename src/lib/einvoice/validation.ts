/**
 * E-Invoice Validation Functions
 * Validates invoice data against LHDN MyInvois and PEPPOL requirements
 */

import {
  ValidationResult,
  ValidationIssue,
  EInvoiceData,
  EInvoiceSupplier,
  EInvoiceBuyer,
  EInvoiceLineItem,
  EInvoiceConfig,
} from './types';
import {
  TAX_TYPE_CODES,
  UNIT_CODES,
  CURRENCY_CODES,
  TIN_PATTERNS,
  BRN_PATTERNS,
} from './constants';

/**
 * Main validation function for e-invoice data
 */
export function validateEInvoiceData(
  data: EInvoiceData,
  config: EInvoiceConfig,
  profile: 'LHDN' | 'PEPPOL' = 'LHDN'
): ValidationResult {
  const errors: ValidationIssue[] = [];
  const warnings: ValidationIssue[] = [];

  // Validate document header
  validateDocumentHeader(data, errors, warnings);

  // Validate supplier
  validateSupplier(data.supplier, config, errors, warnings, profile);

  // Validate buyer
  validateBuyer(data.buyer, errors, warnings, profile);

  // Validate line items
  validateLineItems(data.items, errors, warnings, profile);

  // Validate tax calculations
  validateTaxCalculations(data, errors, warnings);

  // Validate totals
  validateTotals(data, errors, warnings);

  // Currency validation
  if (data.currencyCode !== 'MYR' && !data.exchangeRate) {
    errors.push({
      field: 'exchangeRate',
      message: 'Exchange rate is required for non-MYR currency',
      category: 'invoice',
      severity: 'error',
      code: 'CURRENCY_001',
    });
  }

  // Calculate summary
  const summary = calculateSummary(errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    summary,
  };
}

/**
 * Validate document header fields
 */
function validateDocumentHeader(
  data: EInvoiceData,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Invoice number
  if (!data.invoiceNumber || data.invoiceNumber.trim() === '') {
    errors.push({
      field: 'invoiceNumber',
      message: 'Invoice number is required',
      category: 'invoice',
      severity: 'error',
      code: 'DOC_001',
    });
  } else if (data.invoiceNumber.length > 50) {
    errors.push({
      field: 'invoiceNumber',
      message: 'Invoice number must not exceed 50 characters',
      category: 'invoice',
      severity: 'error',
      code: 'DOC_002',
    });
  }

  // Issue date
  if (!data.issueDate) {
    errors.push({
      field: 'issueDate',
      message: 'Issue date is required',
      category: 'invoice',
      severity: 'error',
      code: 'DOC_003',
    });
  } else {
    const issueDate = new Date(data.issueDate);
    if (isNaN(issueDate.getTime())) {
      errors.push({
        field: 'issueDate',
        message: 'Invalid issue date format',
        category: 'invoice',
        severity: 'error',
        code: 'DOC_004',
      });
    }
  }

  // Currency code
  if (!data.currencyCode) {
    errors.push({
      field: 'currencyCode',
      message: 'Currency code is required',
      category: 'invoice',
      severity: 'error',
      code: 'DOC_005',
    });
  } else if (!CURRENCY_CODES[data.currencyCode as keyof typeof CURRENCY_CODES]) {
    warnings.push({
      field: 'currencyCode',
      message: `Currency code ${data.currencyCode} is not in the standard list`,
      category: 'invoice',
      severity: 'warning',
      code: 'DOC_006',
    });
  }
}

/**
 * Validate supplier/seller information
 */
function validateSupplier(
  supplier: EInvoiceSupplier,
  config: EInvoiceConfig,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  profile: 'LHDN' | 'PEPPOL'
): void {
  // TIN validation
  if (!supplier.tin) {
    errors.push({
      field: 'supplier.tin',
      message: 'Supplier TIN is required',
      category: 'supplier',
      severity: 'error',
      code: 'SUP_001',
    });
  } else if (!validateTIN(supplier.tin)) {
    errors.push({
      field: 'supplier.tin',
      message: 'Invalid TIN format. Expected format: C + 12 digits for company, IG + 10 digits for individual',
      category: 'supplier',
      severity: 'error',
      code: 'SUP_002',
    });
  }

  // Legal name
  if (!supplier.legalName || supplier.legalName.trim() === '') {
    errors.push({
      field: 'supplier.legalName',
      message: 'Supplier legal name is required',
      category: 'supplier',
      severity: 'error',
      code: 'SUP_003',
    });
  } else if (supplier.legalName.length > 300) {
    errors.push({
      field: 'supplier.legalName',
      message: 'Supplier legal name must not exceed 300 characters',
      category: 'supplier',
      severity: 'error',
      code: 'SUP_004',
    });
  }

  // Address validation
  if (!supplier.address) {
    errors.push({
      field: 'supplier.address',
      message: 'Supplier address is required',
      category: 'supplier',
      severity: 'error',
      code: 'SUP_005',
    });
  } else {
    if (!supplier.address.street) {
      errors.push({
        field: 'supplier.address.street',
        message: 'Supplier street address is required',
        category: 'supplier',
        severity: 'error',
        code: 'SUP_006',
      });
    }
    if (!supplier.address.city) {
      errors.push({
        field: 'supplier.address.city',
        message: 'Supplier city is required',
        category: 'supplier',
        severity: 'error',
        code: 'SUP_007',
      });
    }
    if (!supplier.address.postcode) {
      errors.push({
        field: 'supplier.address.postcode',
        message: 'Supplier postcode is required',
        category: 'supplier',
        severity: 'error',
        code: 'SUP_008',
      });
    }
    if (!supplier.address.country) {
      errors.push({
        field: 'supplier.address.country',
        message: 'Supplier country is required',
        category: 'supplier',
        severity: 'error',
        code: 'SUP_009',
      });
    }
  }

  // Contact information (recommended)
  if (!supplier.contact?.phone && !supplier.contact?.email) {
    warnings.push({
      field: 'supplier.contact',
      message: 'Supplier contact information (phone or email) is recommended',
      category: 'supplier',
      severity: 'warning',
      code: 'SUP_010',
    });
  }

  // MSIC code validation
  if (!supplier.msicCode) {
    warnings.push({
      field: 'supplier.msicCode',
      message: 'MSIC code is recommended for Malaysian businesses',
      category: 'supplier',
      severity: 'warning',
      code: 'SUP_011',
    });
  } else if (!/^\d{5}$/.test(supplier.msicCode)) {
    errors.push({
      field: 'supplier.msicCode',
      message: 'MSIC code must be a 5-digit number',
      category: 'supplier',
      severity: 'error',
      code: 'SUP_012',
    });
  }

  // PEPPOL-specific validations
  if (profile === 'PEPPOL') {
    if (!supplier.peppolId) {
      errors.push({
        field: 'supplier.peppolId',
        message: 'PEPPOL participant ID is required for PEPPOL invoices',
        category: 'supplier',
        severity: 'error',
        code: 'SUP_P01',
      });
    }
  }
}

/**
 * Validate buyer information
 */
function validateBuyer(
  buyer: EInvoiceBuyer,
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  profile: 'LHDN' | 'PEPPOL'
): void {
  // Name validation
  if (!buyer.name || buyer.name.trim() === '') {
    errors.push({
      field: 'buyer.name',
      message: 'Buyer name is required',
      category: 'buyer',
      severity: 'error',
      code: 'BUY_001',
    });
  }

  // TIN validation (recommended for B2B)
  if (!buyer.tin && !buyer.idValue) {
    warnings.push({
      field: 'buyer.tin',
      message: 'Buyer TIN or ID is recommended for B2B transactions',
      category: 'buyer',
      severity: 'warning',
      code: 'BUY_002',
    });
  }

  // If TIN is provided, validate format
  if (buyer.tin && !validateTIN(buyer.tin)) {
    errors.push({
      field: 'buyer.tin',
      message: 'Invalid buyer TIN format',
      category: 'buyer',
      severity: 'error',
      code: 'BUY_003',
    });
  }

  // PEPPOL-specific validations
  if (profile === 'PEPPOL') {
    if (!buyer.peppolId) {
      errors.push({
        field: 'buyer.peppolId',
        message: 'PEPPOL participant ID is required for PEPPOL invoices',
        category: 'buyer',
        severity: 'error',
        code: 'BUY_P01',
      });
    }
  }
}

/**
 * Validate line items
 */
function validateLineItems(
  items: EInvoiceLineItem[],
  errors: ValidationIssue[],
  warnings: ValidationIssue[],
  profile: 'LHDN' | 'PEPPOL'
): void {
  if (!items || items.length === 0) {
    errors.push({
      field: 'items',
      message: 'At least one line item is required',
      category: 'items',
      severity: 'error',
      code: 'ITM_001',
    });
    return;
  }

  items.forEach((item, index) => {
    const fieldPrefix = `items[${index}]`;

    // Product name
    if (!item.productName || item.productName.trim() === '') {
      errors.push({
        field: `${fieldPrefix}.productName`,
        message: `Line ${index + 1}: Product name is required`,
        category: 'items',
        severity: 'error',
        code: 'ITM_002',
      });
    }

    // Quantity
    if (item.quantity <= 0) {
      errors.push({
        field: `${fieldPrefix}.quantity`,
        message: `Line ${index + 1}: Quantity must be greater than 0`,
        category: 'items',
        severity: 'error',
        code: 'ITM_003',
      });
    }

    // Unit price
    if (item.unitPrice < 0) {
      errors.push({
        field: `${fieldPrefix}.unitPrice`,
        message: `Line ${index + 1}: Unit price cannot be negative`,
        category: 'items',
        severity: 'error',
        code: 'ITM_004',
      });
    }

    // Unit code
    if (!item.unitCode) {
      errors.push({
        field: `${fieldPrefix}.unitCode`,
        message: `Line ${index + 1}: Unit code is required`,
        category: 'items',
        severity: 'error',
        code: 'ITM_005',
      });
    } else if (!UNIT_CODES[item.unitCode as keyof typeof UNIT_CODES]) {
      warnings.push({
        field: `${fieldPrefix}.unitCode`,
        message: `Line ${index + 1}: Unit code ${item.unitCode} is not in the standard list`,
        category: 'items',
        severity: 'warning',
        code: 'ITM_006',
      });
    }

    // Tax category
    if (!item.taxCategory) {
      errors.push({
        field: `${fieldPrefix}.taxCategory`,
        message: `Line ${index + 1}: Tax category is required`,
        category: 'items',
        severity: 'error',
        code: 'ITM_007',
      });
    } else if (!TAX_TYPE_CODES[item.taxCategory as keyof typeof TAX_TYPE_CODES]) {
      warnings.push({
        field: `${fieldPrefix}.taxCategory`,
        message: `Line ${index + 1}: Tax category ${item.taxCategory} is not in the standard list`,
        category: 'items',
        severity: 'warning',
        code: 'ITM_008',
      });
    }

    // Tax rate
    if (item.taxRate < 0 || item.taxRate > 100) {
      errors.push({
        field: `${fieldPrefix}.taxRate`,
        message: `Line ${index + 1}: Tax rate must be between 0 and 100`,
        category: 'items',
        severity: 'error',
        code: 'ITM_009',
      });
    }

    // Line net amount calculation check
    const expectedNetAmount = item.quantity * item.unitPrice;
    if (Math.abs(item.lineNetAmount - expectedNetAmount) > 0.01) {
      errors.push({
        field: `${fieldPrefix}.lineNetAmount`,
        message: `Line ${index + 1}: Line net amount (${item.lineNetAmount}) does not match quantity * unit price (${expectedNetAmount})`,
        category: 'items',
        severity: 'error',
        code: 'ITM_010',
      });
    }

    // Tax amount calculation check
    const expectedTaxAmount = item.lineNetAmount * (item.taxRate / 100);
    if (Math.abs(item.taxAmount - expectedTaxAmount) > 0.01) {
      warnings.push({
        field: `${fieldPrefix}.taxAmount`,
        message: `Line ${index + 1}: Tax amount (${item.taxAmount}) may not match expected calculation (${expectedTaxAmount.toFixed(2)})`,
        category: 'items',
        severity: 'warning',
        code: 'ITM_011',
      });
    }

    // Tax exemption validation
    if ((item.taxCategory === 'E' || item.taxCategory === '06') && !item.taxExemptionReasonCode) {
      warnings.push({
        field: `${fieldPrefix}.taxExemptionReasonCode`,
        message: `Line ${index + 1}: Tax exemption reason code is recommended for exempt items`,
        category: 'items',
        severity: 'warning',
        code: 'ITM_012',
      });
    }
  });
}

/**
 * Validate tax calculations
 */
function validateTaxCalculations(
  data: EInvoiceData,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Calculate total tax from line items
  const calculatedTax = data.items.reduce((sum, item) => sum + (item.taxAmount || 0), 0);

  // Calculate total tax from tax subtotals
  const subtotalTax = data.taxSubtotals.reduce((sum, subtotal) => sum + subtotal.taxAmount, 0);

  // Check if total tax matches
  if (Math.abs(data.totalTaxAmount - calculatedTax) > 0.01) {
    warnings.push({
      field: 'totalTaxAmount',
      message: `Total tax amount (${data.totalTaxAmount}) does not match sum of line item taxes (${calculatedTax.toFixed(2)})`,
      category: 'tax',
      severity: 'warning',
      code: 'TAX_001',
    });
  }

  // Check if subtotals match total
  if (Math.abs(data.totalTaxAmount - subtotalTax) > 0.01) {
    errors.push({
      field: 'taxSubtotals',
      message: `Tax subtotals (${subtotalTax.toFixed(2)}) do not match total tax amount (${data.totalTaxAmount})`,
      category: 'tax',
      severity: 'error',
      code: 'TAX_002',
    });
  }
}

/**
 * Validate invoice totals
 */
function validateTotals(
  data: EInvoiceData,
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): void {
  // Calculate line extension amount
  const calculatedLineExtension = data.items.reduce((sum, item) => sum + item.lineNetAmount, 0);

  if (Math.abs(data.lineExtensionAmount - calculatedLineExtension) > 0.01) {
    errors.push({
      field: 'lineExtensionAmount',
      message: `Line extension amount (${data.lineExtensionAmount}) does not match sum of line net amounts (${calculatedLineExtension.toFixed(2)})`,
      category: 'invoice',
      severity: 'error',
      code: 'TOT_001',
    });
  }

  // Calculate tax exclusive amount
  const expectedTaxExclusive = data.lineExtensionAmount - (data.allowanceTotalAmount || 0) + (data.chargeTotalAmount || 0);
  if (Math.abs(data.taxExclusiveAmount - expectedTaxExclusive) > 0.01) {
    errors.push({
      field: 'taxExclusiveAmount',
      message: `Tax exclusive amount (${data.taxExclusiveAmount}) calculation error`,
      category: 'invoice',
      severity: 'error',
      code: 'TOT_002',
    });
  }

  // Calculate tax inclusive amount
  const expectedTaxInclusive = data.taxExclusiveAmount + data.totalTaxAmount;
  if (Math.abs(data.taxInclusiveAmount - expectedTaxInclusive) > 0.01) {
    errors.push({
      field: 'taxInclusiveAmount',
      message: `Tax inclusive amount (${data.taxInclusiveAmount}) should equal tax exclusive (${data.taxExclusiveAmount}) + tax (${data.totalTaxAmount})`,
      category: 'invoice',
      severity: 'error',
      code: 'TOT_003',
    });
  }

  // Payable amount should equal tax inclusive
  if (Math.abs(data.payableAmount - data.taxInclusiveAmount) > 0.01) {
    warnings.push({
      field: 'payableAmount',
      message: `Payable amount (${data.payableAmount}) differs from tax inclusive amount (${data.taxInclusiveAmount})`,
      category: 'invoice',
      severity: 'warning',
      code: 'TOT_004',
    });
  }
}

/**
 * Validate Malaysian TIN format
 */
export function validateTIN(tin: string): boolean {
  if (!tin) return false;
  const normalizedTIN = tin.trim().toUpperCase();
  return TIN_PATTERNS.MALAYSIA_GENERAL.test(normalizedTIN);
}

/**
 * Validate Malaysian BRN format
 */
export function validateBRN(brn: string): boolean {
  if (!brn) return false;
  const normalizedBRN = brn.trim().toUpperCase();
  return (
    BRN_PATTERNS.NEW_FORMAT.test(normalizedBRN) ||
    BRN_PATTERNS.OLD_FORMAT.test(normalizedBRN) ||
    BRN_PATTERNS.ROC.test(normalizedBRN) ||
    BRN_PATTERNS.LLP.test(normalizedBRN)
  );
}

/**
 * Calculate validation summary
 */
function calculateSummary(
  errors: ValidationIssue[],
  warnings: ValidationIssue[]
): ValidationResult['summary'] {
  const byCategory: Record<string, number> = {};

  errors.forEach((issue) => {
    byCategory[issue.category] = (byCategory[issue.category] || 0) + 1;
  });

  return {
    totalErrors: errors.length,
    totalWarnings: warnings.length,
    byCategory,
  };
}

/**
 * Quick validation check for e-invoice readiness
 * Returns a simplified result suitable for UI display
 */
export function quickValidationCheck(
  invoiceId: string,
  supplier: Partial<EInvoiceSupplier>,
  buyer: Partial<EInvoiceBuyer>,
  itemCount: number,
  config: Partial<EInvoiceConfig>
): { ready: boolean; issues: string[] } {
  const issues: string[] = [];

  // Config checks
  if (!config.enabled) {
    issues.push('E-Invoice is not enabled');
  }
  if (!config.myinvoisClientId) {
    issues.push('MyInvois Client ID is not configured');
  }
  if (!config.supplierTin) {
    issues.push('Supplier TIN is not configured');
  }

  // Supplier checks
  if (!supplier.legalName) {
    issues.push('Company legal name is missing');
  }
  if (!supplier.address?.street) {
    issues.push('Company street address is missing');
  }
  if (!supplier.address?.city) {
    issues.push('Company city is missing');
  }
  if (!supplier.address?.postcode) {
    issues.push('Company postcode is missing');
  }

  // Buyer checks
  if (!buyer.name) {
    issues.push('Customer name is missing');
  }

  // Item checks
  if (itemCount === 0) {
    issues.push('Invoice must have at least one item');
  }

  return {
    ready: issues.length === 0,
    issues,
  };
}
