# Architecture & Database Improvement Status

Status updated: March 7, 2026.

## Completed Improvements

### Database

- Monetary fields have been migrated to `Decimal` across core commerce/accounting models in `prisma/schema.prisma`.
- Multi-tenant indexing is now present on key tables (`Invoice`, `Customer`, `Product`) with user/date and user/status indexes.
- Redundant persisted line `amount` columns are no longer used in `InvoiceItem`/`ReceiptItem`.
- Several status domains are now enums (`InvoiceStatus`, POS and e-invoice enums) instead of ad hoc strings.

### Backend APIs

- `/api/dashboard` now delegates to `src/lib/data/dashboard.ts` using aggregate/groupBy/raw SQL patterns instead of loading full collections into Node.
- `/api/invoices`, `/api/customers`, `/api/products`, and `/api/receipts` support paginated list responses.
- Invoice creation/update stock flows are transaction-based and preload product records within `$transaction`.
- `/api/receipts` is tenant-scoped via authenticated user (`getUserFromRequest`) and no longer uses fallback user lookup logic.
- Hot-path APIs no longer call `testConnection()` before request work.
- `revalidateTag()` and `unstable_cache()` are now used on list endpoints with user-scoped cache tags.

### Frontend

- `src/app/(dashboard)/dashboard/page.tsx` and `src/app/(dashboard)/invoices/page.tsx` are server-rendered entry pages that prefetch initial data.
- Invoices module has been split into focused components (`invoices-client.tsx`, `invoices-list.tsx`, `payment-dialog.tsx`, `invoice-details-dialog.tsx`).
- Dynamic imports are used for heavier interactions (invoice dialogs, WhatsApp actions, PDF generation, chart modules).

## Remaining Risks and Gaps

### API/Auth Consistency

- `src/app/api/products/route.ts` still supports a default fallback user (`userId = '1'`) when auth token resolution fails. This should be replaced with strict authenticated access (same model used by invoices/customers/receipts).

### Frontend Data Fetching Consistency

- `src/app/(dashboard)/customers/page.tsx` remains client-driven and fetches data in effects; it can be migrated to server-first data loading with smaller client islands.
- `src/app/(dashboard)/dashboard/dashboard-client.tsx` is still a large client component; charts and invoice detail interactions are optimized, but additional splitting and memoization can reduce client bundle size.

### Caching & Query Hygiene

- Dashboard and invoice paths now use better caching, but cache strategy is mixed across modules. A unified cache policy document (TTL + invalidation ownership by domain) is still missing.

### e-Invoice Compliance Scope

- e-invoice schemas/config/readiness APIs exist, but full MyInvois submission/signing and PEPPOL transport remain implementation work (tracked in `einvoice-implementation.md`).

## Prioritized Next Steps

1. Remove unauthenticated fallback user behavior in `src/app/api/products/route.ts` and align with `getUserFromRequest`.
2. Move customers page to server-loaded initial data and keep client code focused on interactions only.
3. Continue dashboard-client decomposition (chart islands, dialog islands, utility extraction) and measure bundle/runtime impact.
4. Document and standardize cache strategy for all domain APIs.
5. Execute e-invoice phase work from `einvoice-implementation.md` with clear sandbox/prod rollout gates.
