import type { DocPage } from '../types';

const screenshot = (name: string, alt: string, caption: string) => ({
  type: 'screenshot' as const,
  src: `/docs/screenshots/${name}.png`,
  alt,
  caption,
});

export const settingsPage: DocPage = {
  slug: 'settings',
  title: 'Settings',
  description: 'Configure your business profile, payment details, modules, and security.',
  category: 'Compliance & Billing',
  categorySlug: 'compliance',
  order: 1,
  keywords: ['settings', 'profile', 'payment', 'bank', 'modules', 'theme', 'security', 'password'],
  relatedSlugs: ['getting-started', 'e-invoice', 'subscription'],
  blocks: [
    { type: 'paragraph', text: 'Settings is where you configure everything about your Invo account — from your company logo to which modules are visible in the sidebar.' },
    screenshot('settings', 'Invo settings page', 'All account and business configuration in one place'),
    { type: 'heading', level: 2, text: 'Settings tabs', id: 'tabs' },
    { type: 'list', items: [
      'Subscription — view your plan, start a trial, or manage billing',
      'Business Details — legal name, registration, TIN, address, logo',
      'Payment Info — bank account, payment methods, DuitNow QR code',
      'E-Invoice — LHDN MyInvois configuration and credentials',
      'Module Settings — enable or disable Receipts, POS, and Accounting',
      'Security — change your password',
    ]},
    { type: 'heading', level: 2, text: 'Invoice themes', id: 'themes' },
    { type: 'paragraph', text: 'Choose how your invoice PDFs look. Invo offers multiple themes including the default and Calm theme. Preview changes before saving.' },
    { type: 'heading', level: 2, text: 'Module toggles', id: 'modules' },
    { type: 'paragraph', text: 'Keep your workspace focused by enabling only the modules you use. Disabled modules are hidden from the sidebar but can be turned back on anytime.' },
  ],
};

export const eInvoicePage: DocPage = {
  slug: 'e-invoice',
  title: 'E-Invoice (LHDN MyInvois)',
  description: 'Configure e-Invoice settings and check invoice readiness for LHDN compliance.',
  category: 'Compliance & Billing',
  categorySlug: 'compliance',
  order: 2,
  keywords: ['e-invoice', 'einvoice', 'lhdn', 'myinvois', 'tin', 'brn', 'sst', 'compliance', 'malaysia'],
  relatedSlugs: ['settings', 'invoices'],
  blocks: [
    { type: 'callout', variant: 'warning', title: 'Current status', text: 'Invo supports e-Invoice setup and readiness checks. Direct API submission to LHDN MyInvois is not yet live — the Submit button shows an under-development message.' },
    { type: 'paragraph', text: 'Malaysia\'s e-Invoice mandate requires businesses to issue validated electronic invoices through LHDN\'s MyInvois system. Invo helps you prepare by checking that your invoices meet the required data fields before submission.' },
    { type: 'heading', level: 2, text: 'What you can do today', id: 'today' },
    { type: 'list', items: [
      'Configure e-Invoice settings (sandbox or production environment, credentials, supplier identity)',
      'Check each invoice for e-Invoice readiness with clear error and warning lists',
      'View existing e-Invoice document statuses if records exist in your database',
    ]},
    { type: 'heading', level: 2, text: 'Setup workflow', id: 'setup' },
    { type: 'steps', items: [
      { title: 'Complete company profile', content: 'In Settings → Business Details, fill in legal name, address, city, postcode, country, and phone number.' },
      { title: 'Configure e-Invoice settings', content: 'Go to Settings → E-Invoice. Enable e-Invoice, set environment (SANDBOX for testing), enter Client ID, Client Secret, Supplier TIN, BRN, and MSIC code.' },
      { title: 'Prepare customer data', content: 'Ensure customers have names and TIN/tax IDs (especially for B2B).' },
      { title: 'Create and send invoices', content: 'Create invoices with at least one line item. Mark as Sent (not Draft) before checking e-Invoice readiness.' },
      { title: 'Check readiness', content: 'Open the invoice details and expand the e-Invoice (LHDN) panel. Fix any missing requirements listed.' },
    ]},
    { type: 'heading', level: 2, text: 'Readiness checklist', id: 'checklist' },
    { type: 'list', items: [
      'E-Invoice enabled in settings',
      'Supplier TIN configured',
      'MyInvois Client ID and Secret saved',
      'Company profile complete (name, address, postcode)',
      'Customer linked with valid details',
      'At least one line item on the invoice',
      'Invoice status is Sent (not Draft or Cancelled)',
    ]},
    { type: 'heading', level: 2, text: 'Manual submission workaround', id: 'workaround' },
    { type: 'paragraph', text: 'Until native MyInvois submission is implemented, generate your invoice details in Invo, then submit through the MyInvois Portal directly. Keep LHDN identifiers and validation proof in your records.' },
    { type: 'heading', level: 2, text: 'Troubleshooting', id: 'troubleshooting' },
    { type: 'list', items: [
      '"E-Invoice is not enabled" — turn it on in Settings → E-Invoice and save',
      '"Supplier TIN is required" — fill in your TIN in e-Invoice settings',
      '"MyInvois Client ID/Secret is required" — enter and save your API credentials',
      '"Company details are required" — complete your business profile',
      '"Invoice must have at least one item" — add line items before checking readiness',
    ]},
  ],
};

export const subscriptionPage: DocPage = {
  slug: 'subscription',
  title: 'Subscription & Plans',
  description: 'Understand Free, Pro, and Lifetime plans, trials, and billing.',
  category: 'Compliance & Billing',
  categorySlug: 'compliance',
  order: 3,
  keywords: ['subscription', 'plan', 'free', 'pro', 'premium', 'trial', 'billing', 'stripe', 'upgrade'],
  relatedSlugs: ['settings', 'invoices'],
  blocks: [
    { type: 'paragraph', text: 'Invo offers flexible plans to match your business stage. Start free, try Pro with a 14-day trial, or choose Lifetime for one-time access.' },
    { type: 'heading', level: 2, text: 'Plan comparison', id: 'plans' },
    { type: 'list', items: [
      'Free — 5 customers, 15 invoices per month, core invoicing features',
      'Pro (Trial/Premium) — unlimited customers and invoices, all modules, priority support',
      'Lifetime — one-time payment for permanent Pro access',
    ]},
    { type: 'heading', level: 2, text: 'Starting a trial', id: 'trial' },
    { type: 'paragraph', text: 'New users get a 14-day Pro trial automatically. During the trial, all features and modules are unlocked. When the trial ends, your account reverts to the Free plan unless you subscribe.' },
    { type: 'heading', level: 2, text: 'Managing billing', id: 'billing' },
    { type: 'steps', items: [
      { title: 'View your plan', content: 'Go to Settings → Subscription to see your current plan and trial status.' },
      { title: 'Upgrade', content: 'Click Upgrade to start a Stripe checkout session for Pro or Lifetime.' },
      { title: 'Manage subscription', content: 'Existing subscribers can open the Stripe Customer Portal to update payment methods, view invoices, or cancel.' },
    ]},
    { type: 'callout', variant: 'note', text: 'If you hit Free plan limits (5 customers or 15 invoices/month), you\'ll see a prompt to upgrade. Your existing data is never deleted.' },
  ],
};

export const faqPage: DocPage = {
  slug: 'faq',
  title: 'FAQ & Troubleshooting',
  description: 'Answers to common questions about using Invo.',
  category: 'Help',
  categorySlug: 'help',
  order: 1,
  keywords: ['faq', 'help', 'troubleshooting', 'question', 'problem', 'support'],
  relatedSlugs: ['getting-started', 'subscription'],
  blocks: [
    { type: 'heading', level: 2, text: 'Account & login', id: 'account' },
    { type: 'list', items: [
      'How do I reset my password? — Go to Settings → Security and use the change password form.',
      'Can I log in with my phone number? — Yes, use phone + TAC (one-time code) or phone + password.',
      'Is my data secure? — Yes. Authentication uses encrypted tokens, and production data is hosted on Supabase (PostgreSQL).',
    ]},
    { type: 'heading', level: 2, text: 'Invoicing', id: 'invoicing' },
    { type: 'list', items: [
      'Can I edit an invoice after sending? — Yes, open the invoice and make changes. Re-download the PDF if needed.',
      'How do partial payments work? — Record each payment amount on the invoice. Status changes to Partial until fully paid.',
      'Can I customize my invoice PDF? — Choose a theme in Settings. Your logo and business details appear automatically.',
    ]},
    { type: 'heading', level: 2, text: 'Modules', id: 'modules' },
    { type: 'list', items: [
      'Why don\'t I see Receipts/POS/Accounting? — These are optional modules. Enable them in Settings → Module Settings.',
      'Does accounting replace my accountant? — No. Invo helps you keep organized books, but consult a qualified accountant for tax filing and compliance advice.',
    ]},
    { type: 'heading', level: 2, text: 'Mobile & offline', id: 'mobile' },
    { type: 'list', items: [
      'Does Invo work on mobile? — Yes. Invo is a Progressive Web App (PWA). Add it to your home screen for an app-like experience.',
      'Can I use Invo offline? — Basic offline support is available via the service worker, but creating and syncing data requires an internet connection.',
    ]},
    { type: 'heading', level: 2, text: 'Getting help', id: 'help' },
    { type: 'paragraph', text: 'Can\'t find what you need? Visit our Contact page to reach the Invo team. For product updates, check the Changelog.' },
    { type: 'callout', variant: 'tip', text: 'Check the Changelog regularly — we ship improvements frequently and document every release.' },
  ],
};
