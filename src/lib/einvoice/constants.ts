/**
 * E-Invoice Constants and Code Lists
 * Based on LHDN MyInvois and PEPPOL BIS Billing 3.0 specifications
 */

// MyInvois API endpoints
export const MYINVOIS_ENDPOINTS = {
  SANDBOX: 'https://preprod-api.myinvois.hasil.gov.my',
  PRODUCTION: 'https://api.myinvois.hasil.gov.my',
} as const;

// MyInvois Identity Server endpoints
export const MYINVOIS_IDENTITY_ENDPOINTS = {
  SANDBOX: 'https://preprod-api.myinvois.hasil.gov.my/connect/token',
  PRODUCTION: 'https://api.myinvois.hasil.gov.my/connect/token',
} as const;

// Document type versions
export const DOCUMENT_TYPE_VERSIONS = {
  INVOICE: { code: '01', version: '1.0' },
  CREDIT_NOTE: { code: '02', version: '1.0' },
  DEBIT_NOTE: { code: '03', version: '1.0' },
  REFUND_NOTE: { code: '04', version: '1.0' },
  SELF_BILLED_INVOICE: { code: '11', version: '1.0' },
  SELF_BILLED_CREDIT_NOTE: { code: '12', version: '1.0' },
  SELF_BILLED_DEBIT_NOTE: { code: '13', version: '1.0' },
  SELF_BILLED_REFUND_NOTE: { code: '14', version: '1.0' },
} as const;

// Tax type codes (LHDN)
export const TAX_TYPE_CODES = {
  '01': { name: 'Sales Tax', description: 'Sales tax on goods' },
  '02': { name: 'Service Tax', description: 'Service tax' },
  '03': { name: 'Tourism Tax', description: 'Tourism tax' },
  '04': { name: 'High-Value Goods Tax', description: 'Tax on high-value goods' },
  '05': { name: 'Sales Tax on Low Value Goods', description: 'Sales tax on imported low value goods' },
  '06': { name: 'Not Applicable', description: 'Tax not applicable' },
  'E': { name: 'Tax Exempt', description: 'Exempt from tax' },
} as const;

// Tax exemption reason codes
export const TAX_EXEMPTION_CODES = {
  'TEXS-EX01': 'Goods subject to exemption under Schedule A, Sales Tax (Persons Exempted from Payment of Tax) Order 2018',
  'TEXS-EX02': 'Goods subject to exemption under Schedule B, Sales Tax (Persons Exempted from Payment of Tax) Order 2018',
  'TEXS-EX03': 'Goods subject to exemption under Schedule C, Sales Tax (Persons Exempted from Payment of Tax) Order 2018',
  'TEXS-EX04': 'Goods exempted under Sales Tax Act 2018, Section 35',
  'TEXR-EX01': 'Services exempted under Service Tax Act 2018, First Schedule',
  'TEXR-EX02': 'Services exempted under Service Tax Act 2018, Section 34',
  'ZRL-EX01': 'Zero-rated supply',
  'OSS-EX01': 'Out of scope supply',
} as const;

// UNECE Recommendation 20 Unit Codes (common ones)
export const UNIT_CODES = {
  'C62': { name: 'One (Unit)', description: 'Unit/Piece' },
  'EA': { name: 'Each', description: 'Each' },
  'HR': { name: 'Hour', description: 'Hour' },
  'DAY': { name: 'Day', description: 'Day' },
  'MON': { name: 'Month', description: 'Month' },
  'ANN': { name: 'Year', description: 'Year' },
  'KGM': { name: 'Kilogram', description: 'Kilogram' },
  'GRM': { name: 'Gram', description: 'Gram' },
  'LTR': { name: 'Litre', description: 'Litre' },
  'MLT': { name: 'Millilitre', description: 'Millilitre' },
  'MTR': { name: 'Metre', description: 'Metre' },
  'CMT': { name: 'Centimetre', description: 'Centimetre' },
  'MTK': { name: 'Square metre', description: 'Square metre' },
  'MTQ': { name: 'Cubic metre', description: 'Cubic metre' },
  'SET': { name: 'Set', description: 'Set' },
  'PR': { name: 'Pair', description: 'Pair' },
  'BX': { name: 'Box', description: 'Box' },
  'PK': { name: 'Pack', description: 'Pack' },
  'CT': { name: 'Carton', description: 'Carton' },
  'LS': { name: 'Lump Sum', description: 'Lump sum' },
} as const;

// ID type codes for buyer/seller identification
export const ID_TYPE_CODES = {
  'NRIC': { name: 'NRIC', description: 'Malaysian National ID' },
  'PASSPORT': { name: 'Passport', description: 'Passport number' },
  'BRN': { name: 'BRN', description: 'Business Registration Number' },
  'ARMY': { name: 'Army ID', description: 'Army identification number' },
  'TIN': { name: 'TIN', description: 'Tax Identification Number' },
} as const;

// Currency codes (ISO 4217)
export const CURRENCY_CODES = {
  'MYR': { name: 'Malaysian Ringgit', symbol: 'RM' },
  'USD': { name: 'US Dollar', symbol: '$' },
  'EUR': { name: 'Euro', symbol: '€' },
  'GBP': { name: 'British Pound', symbol: '£' },
  'SGD': { name: 'Singapore Dollar', symbol: 'S$' },
  'AUD': { name: 'Australian Dollar', symbol: 'A$' },
  'JPY': { name: 'Japanese Yen', symbol: '¥' },
  'CNY': { name: 'Chinese Yuan', symbol: '¥' },
} as const;

// Country codes (ISO 3166-1 alpha-2)
export const COUNTRY_CODES = {
  'MY': 'Malaysia',
  'SG': 'Singapore',
  'ID': 'Indonesia',
  'TH': 'Thailand',
  'PH': 'Philippines',
  'VN': 'Vietnam',
  'US': 'United States',
  'GB': 'United Kingdom',
  'AU': 'Australia',
  'JP': 'Japan',
  'CN': 'China',
  'IN': 'India',
} as const;

// Malaysian state codes
export const MALAYSIAN_STATE_CODES = {
  '01': 'Johor',
  '02': 'Kedah',
  '03': 'Kelantan',
  '04': 'Melaka',
  '05': 'Negeri Sembilan',
  '06': 'Pahang',
  '07': 'Pulau Pinang',
  '08': 'Perak',
  '09': 'Perlis',
  '10': 'Selangor',
  '11': 'Terengganu',
  '12': 'Sabah',
  '13': 'Sarawak',
  '14': 'Wilayah Persekutuan Kuala Lumpur',
  '15': 'Wilayah Persekutuan Labuan',
  '16': 'Wilayah Persekutuan Putrajaya',
} as const;

// Payment means codes (UN/CEFACT)
export const PAYMENT_MEANS_CODES = {
  '01': 'Instrument not defined',
  '10': 'In cash',
  '20': 'Cheque',
  '30': 'Credit transfer',
  '42': 'Payment to bank account',
  '48': 'Bank card',
  '49': 'Direct debit',
  '57': 'Standing agreement',
  '58': 'SEPA credit transfer',
  '59': 'SEPA direct debit',
} as const;

// PEPPOL constants
export const PEPPOL_CONSTANTS = {
  CUSTOMIZATION_ID: 'urn:cen.eu:en16931:2017#compliant#urn:fdc:peppol.eu:2017:poacc:billing:3.0',
  PROFILE_ID: 'urn:fdc:peppol.eu:2017:poacc:billing:01:1.0',
  MALAYSIA_SCHEME_ID: '0195', // Malaysia PEPPOL scheme identifier
} as const;

// TIN validation regex patterns
export const TIN_PATTERNS = {
  MALAYSIA_COMPANY: /^C\d{12}$/, // Company TIN: C + 12 digits
  MALAYSIA_INDIVIDUAL: /^IG\d{10}$/, // Individual TIN: IG + 10 digits
  MALAYSIA_GOVERNMENT: /^G\d{12}$/, // Government TIN: G + 12 digits
  MALAYSIA_PARTNERSHIP: /^D\d{12}$/, // Partnership TIN: D + 12 digits
  MALAYSIA_GENERAL: /^[CDGFI]\d{10,12}$/, // General pattern
} as const;

// BRN validation patterns
export const BRN_PATTERNS = {
  NEW_FORMAT: /^\d{12}$/, // New format: 12 digits
  OLD_FORMAT: /^[A-Z]{2}\d{4,7}$/, // Old format: 2 letters + 4-7 digits
  ROC: /^\d{6,7}-[A-Z]$/, // ROC format
  LLP: /^LLP\d{7}-[A-Z]{3}$/, // LLP format
} as const;
