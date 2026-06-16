# Invoice Interaction Observability Recipe

This recipe documents the custom invoice interaction metrics emitted to `/api/observability/web-vitals`.

## Emitted metric names

- `invoice_detail_fetch_ms`
  - Time from click to invoice detail payload availability in invoices UI.
- `invoice_pdf_trigger_ms`
  - Time from PDF action start to PDF generation trigger.
- `invoice_mutation_roundtrip_ms`
  - Time spent awaiting invoice mutation API round-trip (`cancel`, `mark_sent`, `payment`).

## Payload shape

Metrics are posted as JSON with web-vitals-compatible keys:

- `name` (metric name)
- `value` (duration in milliseconds)
- `id` (invoice id)
- `startTime` (Unix epoch milliseconds)
- `label` (context tag, for example `invoice-dialog`, `payment`)

## Log filtering examples

Current ingestion logs records using:

- `console.info('[web-vitals]', { ...payload })`

To isolate invoice metrics in logs, filter on:

- `name=invoice_detail_fetch_ms`
- `name=invoice_pdf_trigger_ms`
- `name=invoice_mutation_roundtrip_ms`

And optionally split by `label` to compare paths:

- `invoice-list` vs `invoice-dialog`
- `cancel` vs `mark_sent` vs `payment`

## Regression review checklist

1. Capture a baseline run for key invoice interactions.
2. Repeat after code changes touching invoices UI/API.
3. Compare p50/p95 by metric `name` and `label`.
4. Flag regressions where p95 increases meaningfully without product benefit.
