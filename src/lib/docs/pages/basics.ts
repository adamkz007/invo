import type { DocPage } from '../types';

const screenshot = (name: string, alt: string, caption: string) => ({
  type: 'screenshot' as const,
  src: `/docs/screenshots/${name}.png`,
  alt,
  caption,
});

export const gettingStartedPage: DocPage = {
  slug: 'getting-started',
  title: 'Getting Started',
  description: 'Create your account, set up your business profile, and send your first invoice.',
  category: 'Getting Started',
  categorySlug: 'basics',
  order: 1,
  keywords: ['signup', 'register', 'account', 'setup', 'onboarding', 'first invoice', 'company profile'],
  relatedSlugs: ['dashboard', 'settings', 'invoices'],
  blocks: [
    { type: 'paragraph', text: 'Welcome to Invo! This guide walks you through everything you need to start invoicing in minutes. Invo is built for Malaysian freelancers and SMEs — simple enough for daily use, with room to grow into receipts, POS, and full accounting when you need it.' },
    { type: 'heading', level: 2, text: 'Create your account', id: 'create-account' },
    { type: 'steps', items: [
      { title: 'Sign up', content: 'Go to the Sign Up page and enter your name, email, phone number, and password. You can also sign up with a one-time code sent to your phone.' },
      { title: 'Verify and log in', content: 'After signing up, log in with your email and password (or phone + TAC). You\'ll land on your dashboard.' },
      { title: 'Complete your company profile', content: 'Open Settings → Business Details and fill in your legal name, address, registration number, and contact details. These appear on your invoices.' },
    ]},
    screenshot('signup', 'Invo sign up page', 'Create a free account in under a minute'),
    { type: 'heading', level: 2, text: 'Set up your business profile', id: 'business-profile' },
    { type: 'paragraph', text: 'Before sending your first invoice, take a moment to configure your business details and payment information. This saves time later and makes your invoices look professional.' },
    { type: 'list', items: [
      'Business Details — legal name, owner name, registration number, TIN, address, logo',
      'Payment Info — bank account details, payment methods, QR code for DuitNow',
      'Invoice Theme — choose a visual style for your PDF invoices',
    ]},
    screenshot('settings', 'Invo settings page', 'Configure business details, payment info, and modules in Settings'),
    { type: 'callout', variant: 'tip', title: 'Pro tip', text: 'Upload your company logo in Settings. It appears on every invoice PDF you generate.' },
    { type: 'heading', level: 2, text: 'Send your first invoice', id: 'first-invoice' },
    { type: 'steps', items: [
      { title: 'Add a customer', content: 'Go to Customers → New Customer and enter their name and contact details. You can also add customers inline while creating an invoice.' },
      { title: 'Create the invoice', content: 'Navigate to Invoices → New Invoice. Select your customer, add line items from your inventory or type them manually, set the due date, and save.' },
      { title: 'Send or download', content: 'Mark the invoice as Sent when ready. Download the PDF or share it via WhatsApp or email if contact details are on file.' },
    ]},
    screenshot('invoice-new', 'Creating a new invoice in Invo', 'Build invoices with line items, taxes, and customer details'),
    { type: 'heading', level: 2, text: 'Enable optional modules', id: 'modules' },
    { type: 'paragraph', text: 'Invo starts with core invoicing and customer management. You can turn on additional modules in Settings → Module Settings whenever you\'re ready:' },
    { type: 'list', items: [
      'Receipts — issue receipts for cash and in-store sales',
      'POS — restaurant-style point of sale with kitchen chit printing',
      'Accounting — double-entry bookkeeping, expenses, and financial reports',
    ]},
    { type: 'callout', variant: 'note', text: 'Optional modules are off by default. Enable only what you need to keep your sidebar clean and focused.' },
  ],
};

export const dashboardPage: DocPage = {
  slug: 'dashboard',
  title: 'Dashboard',
  description: 'Understand your business at a glance with key metrics and time-range filtering.',
  category: 'Getting Started',
  categorySlug: 'basics',
  order: 2,
  keywords: ['dashboard', 'metrics', 'overview', 'revenue', 'analytics', 'time range'],
  relatedSlugs: ['getting-started', 'invoices'],
  blocks: [
    { type: 'paragraph', text: 'Your dashboard is the home base of Invo. It gives you a quick snapshot of how your business is performing — total revenue, outstanding invoices, recent activity, and more.' },
    screenshot('dashboard', 'Invo dashboard overview', 'Your dashboard shows key business metrics at a glance'),
    { type: 'heading', level: 2, text: 'Key metrics', id: 'metrics' },
    { type: 'list', items: [
      'Total revenue — income from paid and partially paid invoices',
      'Outstanding amount — what customers still owe you',
      'Invoice counts — drafts, sent, paid, and overdue',
      'Recent activity — latest invoices and transactions',
    ]},
    { type: 'heading', level: 2, text: 'Filter by time range', id: 'time-range' },
    { type: 'paragraph', text: 'Use the time range selector at the top of the dashboard to focus on a specific period — this week, this month, this quarter, or a custom range. All metrics update to reflect your selection.' },
    { type: 'callout', variant: 'tip', text: 'Check your dashboard weekly to spot overdue invoices early and follow up with customers promptly.' },
  ],
};
