'use client';

import { useCallback, useRef } from 'react';
import type { InvoiceDetailResponseDto } from '@/lib/dto/invoices';

type InvoiceDetailsCache = Record<string, InvoiceDetailResponseDto>;

export function useInvoiceDetailsCache() {
  const cacheRef = useRef<InvoiceDetailsCache>({});

  const invalidateInvoiceDetails = useCallback((invoiceId: string) => {
    delete cacheRef.current[invoiceId];
  }, []);

  const fetchInvoiceDetails = useCallback(async (invoiceId: string): Promise<InvoiceDetailResponseDto> => {
    const cached = cacheRef.current[invoiceId];
    if (cached) {
      return cached;
    }

    const response = await fetch(`/api/invoices/${invoiceId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch complete invoice details');
    }

    const data: InvoiceDetailResponseDto = await response.json();
    cacheRef.current[invoiceId] = data;
    return data;
  }, []);

  return { fetchInvoiceDetails, invalidateInvoiceDetails };
}
