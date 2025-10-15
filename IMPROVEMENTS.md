# Architecture & Database Optimization Review

## Database
- Monetary columns rely on floats (`schema.prisma` lines 60, 79, 84, 144, 174); migrate to `Decimal` with `@db.Decimal(12, 2)` to avoid rounding, enable efficient aggregations, and support precise comparisons.
- Multi-tenant tables miss secondary indexes on `userId`, `createdAt`, and `status` despite frequent filters; add composite `@@index([userId, createdAt])`, `@@index([userId, status])`, and single-column indexes for high-cardinality foreign keys (for example `productId`) to prevent full scans.
- `InvoiceItem`/`ReceiptItem` store redundant `amount` values computed from quantity × price; replace with database computed columns or derive totals when reading to lower write cost and reduce inconsistency risk.
- Status fields are plain strings; convert to Prisma enums so Postgres can use compact storage and enable partial indexes per status.

## Backend APIs
- `/api/dashboard` loads every invoice with nested items and aggregates in Node (`src/app/api/dashboard/route.ts` 95-355); replace with Prisma `groupBy`/`aggregate`, materialized views, or database-side window functions so only summarized data moves over the wire.
- `/api/invoices` and similar list endpoints return full collections with nested relations and no pagination (`src/app/api/invoices/route.ts` 35-50); expose cursor/take parameters and return lean DTOs with detail endpoints for drill-down.
- Stock adjustments perform sequential `findUnique` + `update` calls (`src/app/api/invoices/route.ts` 211-229, `/api/invoices/[id]` 256-269), inflating latency and risking race conditions; preload products and apply updates inside a single `$transaction` or `updateMany` with optimistic locking.
- `/api/receipts` fetches an arbitrary user via `getValidUserId()` and omits `userId` filters on reads; require the authenticated user, remove the extra lookup, and apply tenant scoping consistently.
- Many routes execute `testConnection()` before real queries (`src/lib/prisma.ts` 22-33, `/api/customer` 22-38, `/api/company` 55-91), doubling round-trips; remove the probe from hot paths and rely on Prisma’s retry handling.
- In-memory caches (`/api/dashboard`, `/api/invoices`, `/api/products`) do not persist across serverless instances and risk stale data; migrate to durable cache layers (Next revalidate tags, Redis, or Supabase) with proper invalidation.

## Frontend
- Dashboard, invoices, and inventory pages are client components that issue `useEffect` fetches (`src/app/(dashboard)/dashboard/page.tsx` 189-205, `/invoices/page.tsx` 143-205, `/inventory/page.tsx` 43-93); convert to server components or use server actions so HTML streams with data and caching works automatically.
- `InvoicesPage` triggers multiple sequential fetches (company, user, invoice detail, receipts) per interaction; consolidate into a single loader response or adopt React Query/SWR with shared caches.
- Customers and inventory pages download entire datasets then paginate/filter in memory; introduce server-side pagination with limit/offset or cursor support and consider virtualized tables for large lists.
- PDF/receipt flows refetch invoice details for every export (`/invoices/page.tsx` 189-279); cache invoice detail in state or prefetch via SWR to avoid redundant network requests.

## Next Steps
1. Update Prisma models to use decimals and add the recommended indexes, then regenerate the client and run migrations.
2. Refactor high-traffic APIs (dashboard, invoices, receipts) to leverage database aggregations, pagination, and transactional stock updates; add regression tests.
3. Move dashboard/invoice screens to server components or data-fetching hooks with shared caches, remove per-request connection tests, and document the new caching strategy.
