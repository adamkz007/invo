# Architecture & Database Improvement Status

Status updated: June 13, 2026 (verified against current codebase).

Legend: `[x] Done`, `[~] Partial`, `[ ] Pending`

## Improvement Verification

### Database

- [x] Monetary fields were migrated toward `Decimal` in core commerce models (see `prisma/migrations/20251002143000_decimal_enums_indexes/migration.sql`).
- [x] Multi-tenant indexes exist on key tables (`Invoice`, `Customer`, `Product`) with user/date and user/status index coverage.
- [~] Redundant persisted line `amount` columns: `InvoiceItem.amount` was removed, but this is not a full "both tables removed" change (no equivalent `ReceiptItem.amount` drop in current migrations).
- [~] Status enums are in place for invoice and POS domains (`InvoiceStatus`, `PosOrderStatus`, `PosOrderType`); e-invoice enum coverage is present in app types, but DB-level enum migration evidence is not explicit in tracked Prisma migrations.

### Backend APIs

- [x] `/api/dashboard` delegates to `src/lib/data/dashboard.ts` and uses aggregate/groupBy/raw SQL patterns.
- [x] `/api/invoices`, `/api/customers`, `/api/products`, and `/api/receipts` expose paginated list responses.
- [x] Invoice create/update stock flows use transactions; product records are preloaded in create flow within `$transaction`.
- [x] `/api/receipts` is tenant-scoped via `getUserFromRequest` and has no fallback user path.
- [x] Hot-path APIs no longer call `testConnection()` before request processing.
- [~] `revalidateTag()` + `unstable_cache()` are used on several list paths (invoices/customers/products), but receipts list currently does not use `unstable_cache()`.

### Frontend

- [x] `src/app/(dashboard)/dashboard/page.tsx` and `src/app/(dashboard)/invoices/page.tsx` are server-rendered entry pages with initial data prefetch.
- [x] Invoices module is split into focused components (`invoices-client.tsx`, `invoices-list.tsx`, `payment-dialog.tsx`, `invoice-details-dialog.tsx`).
- [x] Dynamic/lazy imports are used for heavier interactions (invoice dialogs, WhatsApp actions, PDF generation, chart modules).

## Remaining Risks and Gaps

### API/Auth Consistency

- [ ] `src/app/api/products/route.ts` still uses unauthenticated fallback user behavior (`userId = '1'`) when token resolution fails.

### Frontend Data Fetching Consistency

- [ ] `src/app/(dashboard)/customers/page.tsx` is still client-driven (`useEffect` fetch pattern) instead of server-first with smaller client islands.
- [ ] `src/app/(dashboard)/dashboard/dashboard-client.tsx` remains large and could be split further for better bundle/runtime characteristics.

### Caching & Query Hygiene

- [ ] Cache strategy remains mixed across domains; a unified cache policy doc (TTL + invalidation ownership) is still not present.

### e-Invoice Compliance Scope

- [ ] e-invoice config/readiness APIs exist, but full MyInvois submission/signing + PEPPOL transport remain open (see `einvoice-implementation.md`).

## Prioritized Next Steps

1. Remove fallback user behavior from `src/app/api/products/route.ts` and enforce strict auth with `getUserFromRequest`.
2. Move customers page to server-loaded initial data; keep client components focused on interactions only.
3. Continue decomposition of `dashboard-client.tsx` (chart islands, dialog islands, utility extraction) and re-measure bundle impact.
4. Standardize cache policy across domain APIs and document ownership/invalidation rules.
5. Continue e-invoice phase work from `einvoice-implementation.md` with explicit sandbox/prod rollout gates.

## Execution Checklist (Actionable)

Use this section to track delivery. Suggested owner labels can be replaced with actual names.

### 1) Enforce strict auth on products API

- **Status:** [ ] Not started
- **Priority:** P0
- **Estimated effort:** S (0.5-1 day)
- **Suggested owner:** Backend
- **Scope:** `src/app/api/products/route.ts`
- **Definition of done:**
  - Remove all fallback `userId = '1'` behavior.
  - Replace token-cookie parsing path with `getUserFromRequest`.
  - Return `401` when user is unauthenticated for both `GET` and `POST`.
  - Keep product cache tag invalidation user-scoped.
  - Manual verification: authenticated requests succeed, unauthenticated requests fail.

### 2) Move customers page to server-first data loading

- **Status:** [ ] Not started
- **Priority:** P1
- **Estimated effort:** M (1-2 days)
- **Suggested owner:** Frontend + Backend (if API shape tweaks needed)
- **Scope:** `src/app/(dashboard)/customers/page.tsx` (+ optional new client child component)
- **Definition of done:**
  - Convert page entry to server component data prefetch for initial list payload.
  - Keep client-side logic limited to interactions (search input, pagination, actions).
  - Preserve existing UX behavior (loading, deletion flow, pagination controls).
  - Reduce first render dependency on `useEffect` data bootstrap.
  - Manual verification: first paint includes customer list without waiting for client fetch.

### 3) Decompose dashboard client for bundle/runtime improvements

- **Status:** [ ] Not started
- **Priority:** P2
- **Estimated effort:** M-L (2-3 days)
- **Suggested owner:** Frontend
- **Scope:** `src/app/(dashboard)/dashboard/dashboard-client.tsx`
- **Definition of done:**
  - Extract major UI regions into smaller components (overview cards, charts tab, recent invoices section).
  - Keep heavy modules lazy-loaded (charts/PDF/invoice detail interactions).
  - Add memoization where prop-stable subtrees are re-rendering unnecessarily.
  - Capture before/after metrics (bundle size and interaction timing).
  - No regression in dashboard functionality.

### 4) Standardize caching policy by domain

- **Status:** [ ] Not started
- **Priority:** P1
- **Estimated effort:** S-M (1 day)
- **Suggested owner:** Backend/Architecture
- **Scope:** New doc under `docs/` + minor endpoint alignment
- **Definition of done:**
  - Create a cache policy doc defining per-domain TTL and invalidation ownership.
  - Specify canonical tag conventions (`invoices:${userId}`, `dashboard:${userId}`, etc.).
  - Align outlier endpoints with policy (for example, receipts list caching strategy).
  - Include mutation-to-tag invalidation matrix for invoices/customers/products/receipts/dashboard.

### 5) Advance e-invoice implementation phases

- **Status:** [ ] Not started (beyond readiness/config foundations)
- **Priority:** P0 (Strategic)
- **Estimated effort:** XL (multi-sprint)
- **Suggested owner:** Backend + Product + Compliance
- **Scope:** `einvoice-implementation.md` phases
- **Definition of done (phase gates):**
  - **Gate A (Sandbox submit):** signed payload generation + submit + polling + persisted authority IDs.
  - **Gate B (Operational):** retry/idempotency/event logging + failure handling + support runbook.
  - **Gate C (Production rollout):** prod credentials, controlled tenant rollout, monitoring + rollback plan.
  - **Gate D (PEPPOL):** export (minimum) then transport integration (full).

## Invoices Optimization Plan Audit (Merged from `OPTIMIZATION_PLAN.md`)

Verified against current codebase on June 13, 2026.

### Verified Current State

- [x] `src/app/(dashboard)/invoices/invoices-client.tsx` exists as a reduced module (currently 437 lines).
- [x] Invoices route entry is server-rendered (`src/app/(dashboard)/invoices/page.tsx`) and preloads initial data.
- [x] Invoices module is split into:
  - `invoices-client.tsx`
  - `invoices-list.tsx`
  - `payment-dialog.tsx`
  - `invoice-details-dialog.tsx`
  - `invoices-types.ts`

### Verified Completed Optimizations

- [x] `PLAN_LIMITS` is extracted to `src/lib/plan-limits.ts` and consumed in client code.
- [x] `InvoicesList` is extracted and dynamically imported.
- [x] `PaymentDialog` is extracted and dynamically imported.
- [x] `InvoiceDetailsDialog` is dynamically imported.
- [x] WhatsApp follow-up actions are lazily loaded in list rendering.
- [x] PDF generation is dynamically imported at interaction time.
- [x] Server-side prefetch for initial invoice list and subscription status is in place.

### Remaining Opportunities (Status Against Current Code)

- [~] Further bundle reduction via extracting logic from `invoices-client.tsx` has started (invoice detail cache helpers and mutation/payment handlers extracted), with additional decomposition still pending.
- [~] Data-fetch consistency has improved: invoice mutations no longer rely on unconditional `router.refresh()` and include optimistic status transitions for cancel/mark-sent with rollback; further tuning remains.
- [~] Type/DTO tightening has progressed with shared invoice DTO contracts in place (list/detail/mutation), though broader cross-domain DTO standardization is still pending.
- [ ] Performance observability for invoice interactions is missing (no focused timing instrumentation for invoice detail fetch, PDF trigger, and mutation round-trip).
- [~] Web-vitals ingestion endpoint exists (`/api/observability/web-vitals`), but no invoice-specific regression tracking/budgets are documented.
- [ ] Stable invoices performance budget is not documented.

### Concrete Pending Tasks (Invoices Optimization)

#### 6) Extract interaction logic from `invoices-client.tsx`

- **Status:** [~] In progress (first extraction pass completed)
- **Priority:** P1
- **Estimated effort:** M (1-2 days)
- **Suggested owner:** Frontend
- **Scope:** `src/app/(dashboard)/invoices/invoices-client.tsx`, new `hooks/` or `utils/` files under invoices module
- **Definition of done:**
  - [x] Extract payment form state + validation to dedicated hook/module.
  - [x] Extract invoice detail cache helpers (`invoiceDetailsRef` access + invalidation) to reusable utility/hook.
  - [x] Extract mutation handlers (cancel, mark sent, apply payment) into focused action helpers.
  - Keep behavior parity and pass existing manual regression checks.

#### 7) Reduce mutation refresh cost and add optimistic transitions

- **Status:** [~] In progress (targeted local updates + optimistic status transitions shipped)
- **Priority:** P1
- **Estimated effort:** M (1-2 days)
- **Suggested owner:** Frontend + Backend
- **Scope:** invoices client/list + invoices mutation APIs
- **Definition of done:**
  - [x] Replace unconditional full `router.refresh()` after every mutation with targeted local state updates where safe.
  - [x] Add optimistic UX for at least one high-frequency mutation (payment or mark-sent).
  - [x] Preserve correctness with rollback/error toast path on failed mutation.

#### 8) Standardize invoice DTO contracts (list/detail/mutation)

- **Status:** [x] Completed
- **Priority:** P2
- **Estimated effort:** M (1-2 days)
- **Suggested owner:** Backend
- **Scope:** `src/app/api/invoices/route.ts`, `src/app/api/invoices/[id]/route.ts`, shared types
- **Definition of done:**
  - [x] Define shared response contracts for list/detail/mutation payloads.
  - [x] Remove duplicate ad hoc mapping/casting paths in client.
  - [x] Ensure API handlers and client consumers both use shared DTO types.

#### 9) Add focused invoice interaction timing instrumentation

- **Status:** [x] Completed
- **Priority:** P2
- **Estimated effort:** S-M (0.5-1 day)
- **Suggested owner:** Frontend + Observability
- **Scope:** invoices client interactions + `/api/observability/web-vitals` usage
- **Definition of done:**
  - [x] Track timings for: invoice detail fetch, PDF generation initiation, and mutation round-trip.
  - [x] Emit structured telemetry without affecting UX on failures.
  - [x] Add a lightweight dashboard/query recipe for regression review.

#### 10) Define and document invoices performance budgets

- **Status:** [ ] Not started
- **Priority:** P2
- **Estimated effort:** S (0.5 day)
- **Suggested owner:** Frontend/Architecture
- **Scope:** `IMPROVEMENTS.md` (or dedicated doc under `docs/`)
- **Definition of done:**
  - Record baseline metrics (bundle size, key interaction timings).
  - Define acceptable budget thresholds and alert criteria.
  - Document repeatable before/after measurement steps.

## Suggested Delivery Order

1. P0 security/data boundary fix: products auth (`#1`).
2. P1 architecture consistency: customers server-first (`#2`) and cache policy (`#4`).
3. P1 invoices optimization extraction + mutation UX improvements (`#6`, `#7`).
4. P2 performance hardening: dashboard decomposition (`#3`) + invoice DTO/instrumentation/budgets (`#8`, `#9`, `#10`).
5. Strategic compliance program: e-invoice phase execution (`#5`).
