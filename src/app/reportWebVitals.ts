import type { NextWebVitalsMetric } from 'next/app';

export function reportWebVitals(metric: NextWebVitalsMetric) {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return;

  const body = JSON.stringify({
    id: metric.id,
    name: metric.name,
    label: metric.label,
    value: metric.value,
    startTime: metric.startTime,
  });

  try {
    const url = '/api/observability/web-vitals';
    if ('sendBeacon' in navigator) {
      navigator.sendBeacon(url, body);
    } else {
      fetch(url, {
        body,
        method: 'POST',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
      }).catch(() => {});
    }
  } catch {
    // Avoid surfacing errors to the UI
  }
}

