# Invoices Optimization Plan (Status Refresh)

Status updated: March 7, 2026.

## Current State

- `src/app/(dashboard)/invoices/invoices-client.tsx` is now 459 lines (down from the previous monolith).
- Invoices page is server-rendered at route entry (`src/app/(dashboard)/invoices/page.tsx`) with preloaded initial data.
- Module is split into:
  - `invoices-client.tsx`
  - `invoices-list.tsx`
  - `payment-dialog.tsx`
  - `invoice-details-dialog.tsx`
  - `invoices-types.ts`

## Completed Optimizations

- `PLAN_LIMITS` was extracted to `src/lib/plan-limits.ts` and consumed in client code.
- `InvoicesList` is extracted and dynamically imported.
- `PaymentDialog` is extracted and dynamically imported.
- `InvoiceDetailsDialog` is dynamically imported.
- WhatsApp follow-up actions are lazily loaded inside the list module.
- PDF generation is dynamically imported at interaction time.
- Server-side prefetch for initial invoice list and subscription status is in place.

## Remaining Optimization Opportunities

### 1) Further Client Bundle Reduction

- Split parts of `invoices-client.tsx` into smaller hooks/util modules:
  - payment form state + validation
  - invoice detail cache utilities
  - status transition handlers
- Audit icon imports and remove rarely used symbols from primary render paths.

### 2) Data Fetching Consistency

- Keep list rendering server-first while progressively migrating some interaction fetches to shared cache hooks (SWR/React Query) if repeated across views.
- Evaluate optimistic UI updates for payment/cancel actions to reduce full `router.refresh()` dependency.

### 3) Type and DTO Tightening

- Standardize API response DTOs for list/detail/payment routes to reduce ad hoc casting and duplicate mapping logic.

### 4) Observability for Performance

- Add timing instrumentation for invoice detail fetch, PDF generation trigger, and mutation round-trips.
- Track performance regressions in `/api/observability/web-vitals`.

## Next Execution Steps

1. Extract invoice interaction logic from `invoices-client.tsx` into dedicated hooks.
2. Add focused client-side perf instrumentation for invoice list interactions.
3. Benchmark bundle and interaction timing before/after extraction.
4. Document stable performance budgets for invoices UI in this file.

## Files in Scope

- `src/app/(dashboard)/invoices/invoices-client.tsx`
- `src/app/(dashboard)/invoices/invoices-list.tsx`
- `src/app/(dashboard)/invoices/payment-dialog.tsx`
- `src/app/(dashboard)/invoices/invoice-details-dialog.tsx`
- `src/lib/plan-limits.ts`
- `src/lib/data/invoices.ts`
