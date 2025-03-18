'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/scripts/register-sw';

export function PWAProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <>{children}</>;
} 