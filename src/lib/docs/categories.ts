import type { DocCategory } from './types';

export const docCategories: DocCategory[] = [
  {
    slug: 'basics',
    title: 'Getting Started',
    description: 'Set up your account and learn the basics',
    order: 1,
  },
  {
    slug: 'core',
    title: 'Core Features',
    description: 'Invoices, customers, and everyday workflows',
    order: 2,
  },
  {
    slug: 'modules',
    title: 'Optional Modules',
    description: 'Receipts, inventory, POS, and accounting',
    order: 3,
  },
  {
    slug: 'compliance',
    title: 'Compliance & Billing',
    description: 'E-Invoice, subscriptions, and settings',
    order: 4,
  },
  {
    slug: 'help',
    title: 'Help',
    description: 'FAQs and troubleshooting',
    order: 5,
  },
];
