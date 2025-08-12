'use client';

import { useSettings } from '@/contexts/settings-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { settings } = useSettings();
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard if POS module is disabled
    if (!settings.enablePosModule) {
      router.push('/dashboard');
    }
  }, [settings.enablePosModule, router]);

  // If POS module is disabled, don't render children
  if (!settings.enablePosModule) {
    return null;
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      {children}
    </div>
  );
}