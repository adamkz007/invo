import type { Metadata } from 'next';
import { DocsShell } from '@/components/docs/docs-shell';

export const metadata: Metadata = {
  title: 'Documentation | Invo',
  description: 'User guide for Invo — invoicing, customers, receipts, POS, accounting, and e-Invoice for Malaysian SMEs.',
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
