import type { DocPage } from '../types';

const screenshot = (name: string, alt: string, caption: string) => ({
  type: 'screenshot' as const,
  src: `/docs/screenshots/${name}.png`,
  alt,
  caption,
});

export const invoicesPage: DocPage = {
  slug: 'invoices',
  title: 'Invoices',
  description: 'Create, send, track, and collect payment on professional invoices.',
  category: 'Core Features',
  categorySlug: 'core',
  order: 1,
  keywords: ['invoice', 'billing', 'pdf', 'payment', 'draft', 'sent', 'paid', 'overdue', 'partial'],
  relatedSlugs: ['customers', 'inventory', 'e-invoice'],
  blocks: [
    { type: 'paragraph', text: 'Invoices are the heart of Invo. Create professional invoices, track their status, record partial payments, and generate PDFs — all from one place.' },
    screenshot('invoices-list', 'Invoice list in Invo', 'View and manage all your invoices in one list'),
    { type: 'heading', level: 2, text: 'Creating an invoice', id: 'create' },
    { type: 'steps', items: [
      { title: 'Open the invoice form', content: 'Click Invoices in the sidebar, then New Invoice (or the + button).' },
      { title: 'Select a customer', content: 'Choose an existing customer or add a new one inline. Customer details auto-fill on the invoice.' },
      { title: 'Add line items', content: 'Pick products from your inventory or enter items manually. Set quantity, unit price, and tax if applicable.' },
      { title: 'Set dates and notes', content: 'Choose the invoice date, due date, and add any notes or terms for your customer.' },
      { title: 'Save', content: 'Save as Draft to finish later, or mark as Sent when you\'re ready to deliver it.' },
    ]},
    screenshot('invoice-new', 'New invoice form', 'Add customers, line items, and payment terms'),
    { type: 'heading', level: 2, text: 'Invoice statuses', id: 'statuses' },
    { type: 'list', items: [
      'Draft — still being prepared, not yet sent to the customer',
      'Sent — delivered to the customer, awaiting payment',
      'Partial — customer has paid part of the total amount',
      'Paid — fully paid',
      'Overdue — past the due date and still unpaid',
      'Cancelled — voided and no longer active',
    ]},
    { type: 'heading', level: 2, text: 'Recording payments', id: 'payments' },
    { type: 'paragraph', text: 'When a customer pays, open the invoice and record the payment amount. Invo supports partial payments — record what was received and the remaining balance updates automatically. When fully paid, the status changes to Paid.' },
    { type: 'heading', level: 2, text: 'Downloading and sharing', id: 'sharing' },
    { type: 'paragraph', text: 'Every invoice can be downloaded as a PDF. If your customer has a phone number or email on file, you can share directly via WhatsApp or email from the invoice details view.' },
    { type: 'callout', variant: 'note', title: 'Free plan limits', text: 'The Free plan includes up to 15 invoices per month and 5 customers. Upgrade to Pro for unlimited invoices and customers.' },
  ],
};

export const customersPage: DocPage = {
  slug: 'customers',
  title: 'Customers',
  description: 'Manage your customer database and view purchase history.',
  category: 'Core Features',
  categorySlug: 'core',
  order: 2,
  keywords: ['customer', 'client', 'contact', 'crm', 'purchase history'],
  relatedSlugs: ['invoices', 'getting-started'],
  blocks: [
    { type: 'paragraph', text: 'Keep all your customer information in one place. Add contact details, view invoice history, and quickly select customers when creating new invoices.' },
    screenshot('customers', 'Customer list in Invo', 'Search and manage your customer database'),
    { type: 'heading', level: 2, text: 'Adding a customer', id: 'add' },
    { type: 'steps', items: [
      { title: 'Navigate to Customers', content: 'Click Customers in the sidebar, then New Customer.' },
      { title: 'Fill in details', content: 'Enter name (required), email, phone, address, and any notes. For e-Invoice compliance, include TIN/tax ID for B2B customers.' },
      { title: 'Save', content: 'Click Save. The customer is now available when creating invoices.' },
    ]},
    { type: 'heading', level: 2, text: 'Customer details', id: 'details' },
    { type: 'paragraph', text: 'Click any customer to view their profile and purchase history. See all invoices linked to that customer, total amount billed, and outstanding balances.' },
    { type: 'heading', level: 2, text: 'Quick add from invoices', id: 'inline' },
    { type: 'paragraph', text: 'You don\'t always need to visit the Customers page first. When creating an invoice, use the inline "Add Customer" option to create a new customer on the spot.' },
    { type: 'callout', variant: 'tip', text: 'Add WhatsApp numbers to customer profiles for one-tap invoice sharing.' },
  ],
};
