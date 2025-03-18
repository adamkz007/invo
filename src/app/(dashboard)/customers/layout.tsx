import { Viewport } from 'next';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
};

export default function CustomersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
} 