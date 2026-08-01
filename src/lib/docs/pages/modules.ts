import type { DocPage } from '../types';

const screenshot = (name: string, alt: string, caption: string) => ({
  type: 'screenshot' as const,
  src: `/docs/screenshots/${name}.png`,
  alt,
  caption,
});

export const receiptsPage: DocPage = {
  slug: 'receipts',
  title: 'Receipts',
  description: 'Issue receipts for cash and in-store transactions.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 1,
  keywords: ['receipt', 'cash', 'in-store', 'proof of payment'],
  relatedSlugs: ['inventory', 'pos', 'settings'],
  blocks: [
    { type: 'callout', variant: 'note', text: 'The Receipts module is optional. Enable it in Settings → Module Settings before use.' },
    { type: 'paragraph', text: 'Receipts are perfect for walk-in customers, cash sales, and situations where you need immediate proof of payment without a formal invoice.' },
    screenshot('receipts', 'Receipts list in Invo', 'View and create receipts for cash transactions'),
    { type: 'heading', level: 2, text: 'Creating a receipt', id: 'create' },
    { type: 'steps', items: [
      { title: 'Enable the module', content: 'Go to Settings → Module Settings and turn on Receipts.' },
      { title: 'New receipt', content: 'Navigate to Receipts → New Receipt.' },
      { title: 'Add items and payment', content: 'Add line items, select payment method (cash, card, etc.), and save. A receipt number is generated automatically.' },
    ]},
    { type: 'heading', level: 2, text: 'Receipts vs invoices', id: 'difference' },
    { type: 'list', items: [
      'Receipts confirm payment has been received — use for immediate, paid transactions',
      'Invoices request payment — use when billing a customer who will pay later',
      'Receipts don\'t require a linked customer, though you can add one optionally',
    ]},
  ],
};

export const inventoryPage: DocPage = {
  slug: 'inventory',
  title: 'Inventory',
  description: 'Manage products and services with stock tracking.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 2,
  keywords: ['inventory', 'products', 'stock', 'catalog', 'services', 'sku'],
  relatedSlugs: ['invoices', 'receipts', 'pos'],
  blocks: [
    { type: 'paragraph', text: 'Your inventory is the product and service catalog that powers invoices, receipts, and POS orders. Add items once and reuse them everywhere.' },
    screenshot('inventory', 'Inventory list in Invo', 'Manage products, services, and stock levels'),
    { type: 'heading', level: 2, text: 'Adding products', id: 'add' },
    { type: 'steps', items: [
      { title: 'Go to Inventory', content: 'Click Inventory in the sidebar, then New Product.' },
      { title: 'Enter details', content: 'Set the name, description, unit price, and optionally track stock quantity and SKU.' },
      { title: 'Save', content: 'The product is now available when creating invoices, receipts, or POS orders.' },
    ]},
    { type: 'heading', level: 2, text: 'Stock tracking', id: 'stock' },
    { type: 'paragraph', text: 'Enable stock tracking on any product to monitor quantity on hand. Stock decreases automatically when items are sold through invoices, receipts, or POS.' },
    { type: 'heading', level: 2, text: 'Quick edit', id: 'quick-edit' },
    { type: 'paragraph', text: 'Update prices and stock directly from the inventory list without opening the full edit form — handy for price changes during the day.' },
  ],
};

export const posPage: DocPage = {
  slug: 'pos',
  title: 'Point of Sale (POS)',
  description: 'Take orders, manage tables, and print kitchen chits for restaurants.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 3,
  keywords: ['pos', 'point of sale', 'restaurant', 'kitchen chit', 'orders', 'tables'],
  relatedSlugs: ['inventory', 'receipts', 'settings'],
  blocks: [
    { type: 'callout', variant: 'note', text: 'The POS module is optional. Enable it in Settings → Module Settings.' },
    { type: 'paragraph', text: 'Invo\'s POS is designed for restaurants and food businesses. Take orders, assign them to tables, and print kitchen chits for the back of house.' },
    screenshot('pos', 'POS order screen in Invo', 'Take orders and manage tables from the POS screen'),
    { type: 'heading', level: 2, text: 'Taking an order', id: 'orders' },
    { type: 'steps', items: [
      { title: 'Open POS', content: 'Click POS in the sidebar to see active orders and tables.' },
      { title: 'New order', content: 'Tap New Order, select items from your menu (inventory), and assign to a table if applicable.' },
      { title: 'Send to kitchen', content: 'Print a kitchen chit so the kitchen team knows what to prepare.' },
      { title: 'Complete the sale', content: 'When the customer is ready to pay, finalize the order and optionally generate a receipt.' },
    ]},
    { type: 'heading', level: 2, text: 'POS settings', id: 'settings' },
    { type: 'paragraph', text: 'Configure your POS in POS → Settings. Set up table layouts, default payment methods, and kitchen chit printer preferences.' },
  ],
};

export const accountingPage: DocPage = {
  slug: 'accounting',
  title: 'Accounting Overview',
  description: 'Double-entry bookkeeping, financial reports, and bank reconciliation.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 4,
  keywords: ['accounting', 'bookkeeping', 'double entry', 'ledger', 'chart of accounts', 'financial reports'],
  relatedSlugs: ['accounting-transactions', 'accounting-expenses', 'accounting-reports'],
  blocks: [
    { type: 'callout', variant: 'note', text: 'The Accounting module is optional. Enable it in Settings → Module Settings.' },
    { type: 'paragraph', text: 'Invo\'s accounting module gives you proper double-entry bookkeeping without needing separate software. Track transactions, manage expenses, run financial reports, and reconcile your bank accounts.' },
    screenshot('accounting-overview', 'Accounting overview in Invo', 'Accounting dashboard with key financial metrics'),
    { type: 'heading', level: 2, text: 'What\'s included', id: 'features' },
    { type: 'list', items: [
      'Transactions — manual journal entries for any business event',
      'Expenses — track and categorize business spending',
      'Chart of Accounts — organize your accounts by type (assets, liabilities, equity, revenue, expenses)',
      'General Ledger — see every debit and credit in one place',
      'Financial Reports — Trial Balance, Balance Sheet, Profit & Loss, Cash Flow',
      'Bank Reconciliation — match bank statements to your records',
      'Tax Rates — configure SST and other tax rates',
    ]},
    { type: 'heading', level: 2, text: 'Getting started with accounting', id: 'start' },
    { type: 'steps', items: [
      { title: 'Enable the module', content: 'Turn on Accounting in Settings → Module Settings.' },
      { title: 'Review your chart of accounts', content: 'Invo sets up a default chart of accounts. Customize it under Accounting → Accounts.' },
      { title: 'Record your first transaction', content: 'Start with Accounting → Transactions or Expenses depending on what you need to record.' },
      { title: 'Run a report', content: 'Once you have entries, visit Accounting → Reports to see your financial position.' },
    ]},
    { type: 'callout', variant: 'tip', text: 'Invoices and receipts can post automatically to accounting when configured — reducing manual data entry.' },
  ],
};

export const accountingTransactionsPage: DocPage = {
  slug: 'accounting-transactions',
  title: 'Journal Transactions',
  description: 'Create and manage manual journal entries.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 5,
  keywords: ['journal', 'transaction', 'debit', 'credit', 'entry', 'double entry'],
  relatedSlugs: ['accounting', 'accounting-expenses'],
  blocks: [
    { type: 'paragraph', text: 'Journal transactions are the building blocks of double-entry bookkeeping. Every transaction has at least one debit and one credit, and they must balance.' },
    screenshot('accounting-transactions', 'Journal transactions in Invo', 'Create and review journal entries'),
    { type: 'heading', level: 2, text: 'Creating a transaction', id: 'create' },
    { type: 'steps', items: [
      { title: 'Go to Transactions', content: 'Navigate to Accounting → Transactions.' },
      { title: 'New entry', content: 'Click New Transaction and set the date and description.' },
      { title: 'Add lines', content: 'Add debit and credit lines, each linked to an account from your chart of accounts. Total debits must equal total credits.' },
      { title: 'Save', content: 'Save the transaction. It appears in your general ledger immediately.' },
    ]},
    { type: 'callout', variant: 'warning', title: 'Balance check', text: 'A journal entry cannot be saved unless debits and credits are equal. If you see a balance error, review your line amounts.' },
  ],
};

export const accountingExpensesPage: DocPage = {
  slug: 'accounting-expenses',
  title: 'Expenses',
  description: 'Track and categorize business expenses.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 6,
  keywords: ['expense', 'spending', 'cost', 'category', 'receipt'],
  relatedSlugs: ['accounting', 'accounting-reports'],
  blocks: [
    { type: 'paragraph', text: 'Record business expenses to keep your books accurate and make tax filing easier. Each expense is categorized and posted to the correct account automatically.' },
    { type: 'heading', level: 2, text: 'Recording an expense', id: 'create' },
    { type: 'steps', items: [
      { title: 'New expense', content: 'Go to Accounting → Expenses → New Expense.' },
      { title: 'Fill in details', content: 'Enter the date, amount, vendor/payee, category, and description.' },
      { title: 'Save', content: 'The expense posts to your books and appears in expense reports.' },
    ]},
    { type: 'heading', level: 2, text: 'Expense categories', id: 'categories' },
    { type: 'paragraph', text: 'Categorize expenses consistently — rent, utilities, supplies, travel, marketing, and more. Good categorization makes your Profit & Loss report meaningful at year-end.' },
  ],
};

export const accountingReportsPage: DocPage = {
  slug: 'accounting-reports',
  title: 'Financial Reports',
  description: 'Trial Balance, Balance Sheet, P&L, and Cash Flow statements.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 7,
  keywords: ['report', 'trial balance', 'balance sheet', 'profit loss', 'p&l', 'cash flow', 'financial statement'],
  relatedSlugs: ['accounting', 'accounting-reconciliation'],
  blocks: [
    { type: 'paragraph', text: 'Financial reports turn your transaction data into actionable insights. Run them anytime from Accounting → Reports.' },
    { type: 'heading', level: 2, text: 'Available reports', id: 'reports' },
    { type: 'list', items: [
      'Trial Balance — lists all account balances to verify debits equal credits',
      'Balance Sheet — snapshot of assets, liabilities, and equity at a point in time',
      'Profit & Loss — revenue minus expenses over a period',
      'Cash Flow — how cash moved in and out of your business',
    ]},
    { type: 'heading', level: 2, text: 'Running a report', id: 'run' },
    { type: 'steps', items: [
      { title: 'Select a report', content: 'Go to Accounting → Reports and choose the report you need.' },
      { title: 'Set the date range', content: 'Pick the period you want to analyze.' },
      { title: 'Review and export', content: 'Review the results on screen. Use your browser\'s print function to save as PDF if needed.' },
    ]},
    { type: 'callout', variant: 'tip', text: 'Run a Trial Balance monthly to catch bookkeeping errors early.' },
  ],
};

export const accountingReconciliationPage: DocPage = {
  slug: 'accounting-reconciliation',
  title: 'Bank Reconciliation',
  description: 'Match your bank statements to your accounting records.',
  category: 'Optional Modules',
  categorySlug: 'modules',
  order: 8,
  keywords: ['reconciliation', 'bank', 'statement', 'match', 'cleared'],
  relatedSlugs: ['accounting', 'accounting-reports'],
  blocks: [
    { type: 'paragraph', text: 'Bank reconciliation ensures your books match your actual bank balance. Match each bank transaction to the corresponding entry in Invo.' },
    { type: 'heading', level: 2, text: 'How to reconcile', id: 'process' },
    { type: 'steps', items: [
      { title: 'Open Reconciliation', content: 'Go to Accounting → Reconciliation.' },
      { title: 'Select your bank account', content: 'Choose the account you\'re reconciling.' },
      { title: 'Match transactions', content: 'Compare your bank statement line by line. Mark matching entries as cleared.' },
      { title: 'Resolve differences', content: 'If balances don\'t match, look for missing entries, duplicates, or timing differences (outstanding cheques, pending deposits).' },
    ]},
    { type: 'callout', variant: 'tip', text: 'Reconcile monthly — it\'s much easier to find discrepancies when you do it regularly.' },
  ],
};
