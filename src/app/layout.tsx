import type { Metadata, Viewport } from "next";
import { DM_Serif_Text, Open_Sans } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/providers/toast-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { SettingsProvider } from '@/contexts/settings-context';
import { PWAProvider } from "@/components/providers/pwa-provider";

const dmSerifText = DM_Serif_Text({
  variable: "--font-dm-serif",
  weight: ["400"],
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const openSans = Open_Sans({
  variable: "--font-open-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://invo.my'),
  title: {
    default: 'Invo - Smart Invoicing for Malaysian SMEs',
    template: '%s | Invo'
  },
  description: 'Practical invoicing solution designed for small and medium enterprises in Malaysia. Streamline your billing, track expenses, and manage finances with ease.',
  keywords: ['invoicing', 'SME', 'Malaysia', 'billing', 'finance', 'business', 'accounting', 'receipts'],
  authors: [{ name: 'Invo Team' }],
  creator: 'Invo',
  publisher: 'Invo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_MY',
    url: 'https://invo.my',
    siteName: 'Invo',
    title: 'Invo - Smart Invoicing for Malaysian SMEs',
    description: 'Practical invoicing solution designed for small and medium enterprises in Malaysia.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Invo - Smart Invoicing Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Invo - Smart Invoicing for Malaysian SMEs',
    description: 'Practical invoicing solution designed for small and medium enterprises in Malaysia.',
    images: ['/twitter-image.jpg'],
    creator: '@invo_my',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
  },
  alternates: {
    canonical: 'https://invo.my',
    languages: {
      'en-MY': 'https://invo.my',
      'ms-MY': 'https://invo.my/ms',
    },
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'mask-icon',
        url: '/icons/maskable-icon.png',
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Invo',
  },
  applicationName: 'Invo',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#4f46e5',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${dmSerifText.variable} ${openSans.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SettingsProvider>
            <PWAProvider>
              <ToastProvider>
                {children}
                <div id="datepicker-portal" />
              </ToastProvider>
            </PWAProvider>
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
