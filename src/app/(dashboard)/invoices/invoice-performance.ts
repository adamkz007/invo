'use client';

type InvoiceMetricName =
  | 'invoice_detail_fetch_ms'
  | 'invoice_pdf_trigger_ms'
  | 'invoice_mutation_roundtrip_ms';

interface InvoiceMetricPayload {
  name: InvoiceMetricName;
  value: number;
  id: string;
  startTime: number;
  label?: string;
}

export function emitInvoiceMetric(payload: InvoiceMetricPayload): void {
  const body = JSON.stringify(payload);

  try {
    const url = '/api/observability/web-vitals';
    if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      navigator.sendBeacon(url, body);
      return;
    }

    if (typeof fetch !== 'undefined') {
      fetch(url, {
        body,
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  } catch {
    // Metrics should never break invoice interactions.
  }
}
