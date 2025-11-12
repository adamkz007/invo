## Scope & Objectives

* Deliver full double-entry accounting with Wave-level parity, optimized for mobile-first UX: AR/AP, expenses, bank reconciliation, IFRS reports, tax, audit trail, exports, RBAC.

* Seamless hookups to existing invoice/receipt flows so journals post automatically.

* No database resets; additive Prisma migrations only. Explicit approval required for any incompatible changes.

## Mobile‑First UX Strategy

* Navigation: use existing mobile bottom nav in `src/app/(dashboard)/layout.tsx` and add "Accounting" with context-aware icons.

* Layouts: card-based lists instead of wide tables; collapsible sections; sticky action bars; single-column forms.

* Touch targets: 44px minimum, large inputs, numeric keyboards for amounts, date pickers optimized for touch.

* Performance: lazy loading, pagination/infinite scroll, SWR caching, skeletons, virtualization for ledgers.

* Offline/PWA: leverage existing service worker; queue journal/form submissions and retry on reconnect.

* Accessibility: high-contrast themes, proper role/aria labels, keyboard nav parity.

* Attachments: mobile camera upload for receipts/expenses; drag-drop optional.

## Architecture Overview

* Next.js App Router + Prisma + TypeScript; reuse `src/lib/decimal.ts` and design patterns in existing modules.

* Module structure:

  * UI: `src/app/(dashboard)/accounting/*` pages and lightweight client components.

  * API: `src/app/api/accounting/*` route handlers.

  * Data utilities: `src/lib/data/accounting/*` aggregations.

## Data Model (Prisma Additions)

* `Account`: code, name, type, parentId, isActive.

* `JournalEntry`: date, memo, source, referenceId, postedAt, status, createdBy.

* `JournalLine`: entryId, accountId, debit, credit, entityType, entityId.

* `TaxRate`: name, rate, jurisdiction, accounts mapping.

* `BankAccount`: name, currency, maskedNumber, provider, `glAccountId`, lastSyncAt.

* `BankTransaction`: bankAccountId, date, amount, description, externalRef, status, matchedLineId.

* `Reconciliation`: bankAccountId, periodStart, periodEnd, statementBalance, bookBalance, difference, reconciledAt.

* `Expense`: vendor, date, lines, amounts, tax, status, attachments.

* `AuditLog`: entity, entityId, action, timestamp, userId, before, after.

* RBAC: extend `User.role` enum and add optional `permissions` JSON.

## Double‑Entry Posting Rules

* Invoices: Dr AR / Cr Revenue (+ Cr Tax). Payments: Dr Cash / Cr AR. Receipts: Dr Cash / Cr Revenue.

* Expenses/Bills: Dr Expense / Cr AP (or Cash). Tax remittance: Dr Tax Liability / Cr Cash.

* Closing: close revenue/expenses to retained earnings; lock fiscal year.

* Immutable `locked` entries; corrections via reversing entries.

## Integration with Existing Flows

* `POST /api/invoices`: create AR/Revenue/Tax journal.

* `PATCH /api/invoices/[id]` payments: post cash receipt.

* `POST /api/receipts`: post cash sale journal.

* Prisma transactions ensure atomic writes for domain + journals.

## Mobile‑First UI Pages

* `Accounting Dashboard`: mobile cards for AR/AP aging, cash, revenue, expenses, tax liability with tap-through.

* `Ledger`: searchable, filterable list (card rows); infinite scroll; quick actions; CSV/PDF export.

* `Journal Entries`: compact stepper form (accounts → amounts → review); enforce debits=credits.

* `Chart of Accounts`: list + detail with collapsible hierarchy; quick add.

* `Expenses/Bills`: simple receipt scanner/upload; vendor selector; category chips.

* `Bank Reconciliation`: CSV import wizard; match/unmatch with swipe gestures; reconcile summary card.

* `Reports`: mobile-optimized summaries with expandable sections; export buttons.

* `Settings`: tax rates, fiscal year, closing, bank accounts.

## API Endpoints

* Accounts: `GET/POST/PATCH/DELETE /api/accounting/accounts`.

* Journals: `GET/POST/PATCH /api/accounting/journals` + `POST /post`, `POST /reverse`.

* Ledger: `GET /api/accounting/ledger` (paginated, filters, export modes).

* Expenses: `GET/POST/PATCH /api/accounting/expenses`.

* Bank: `POST /api/accounting/bank/import-csv`, `GET /bank/accounts`, `GET/PATCH /bank/transactions`, `POST /bank/reconcile`.

* Reports: `GET /api/accounting/reports/{trial-balance|pl|balance-sheet|cash-flow|tax}`.

* RBAC enforcement in handlers; middleware protects `/accounting`.

## Reporting (IFRS)

* Trial Balance, P\&L, Balance Sheet, Cash Flow (Indirect) built from account types and period filters.

* Tax reports compute output tax liability and remittance.

## Tax Configuration & Calculation

* `TaxRate` per jurisdiction; default at company; line-level tax on invoices/expenses; post to liability.

## Bank Reconciliation

* CSV import first; auto-matching engine; manual matching with mobile swipe; reconcile and lock period.

* Future provider integrations behind feature flag.

## Audit Trail

* Prisma middleware logs before/after changes to `AuditLog`.

* Per-entity audit UI.

## RBAC

* Roles: `ADMIN`, `ACCOUNTANT`, `STAFF`, `VIEWER` with UI gating and server checks.

## Exports

* CSV for ledger/reports; PDF templates leveraging existing generator.

## Security & Backups

* Encrypt sensitive fields with AES-GCM; upgrade password hashing to bcrypt/argon2; ensure strong JWT secrets.

* Supabase scheduled backups or provider cron; document restore.

## Testing & Validation

* Unit tests with `vitest` for posting, tax, reports.

* Playwright E2E: invoice → journal → payment → reconciliation → reports.

* Integrity checks: debits=credits, AR/AP aging, lock immutability.

* Performance tests: large volumes; paginate; index key fields.

## Rollout Phases

* P1: Data model + mobile dashboard + posting hooks.

* P2: Ledger + Journal UI (mobile-first) + Trial Balance.

* P3: P\&L, Balance Sheet, tax config + posting.

* P4: Expenses/AP + Bank CSV + matching.

* P5: Reconciliation UI + Cash Flow + exports.

* P6: RBAC + Audit trail + security hardening.

* P7: Year-end closing + performance tuning.

## Approvals & Notes

* Additive migrations only; any incompatible changes require explicit approval.

* Banking integrations optional; credentials required if enabled.

* We will follow existing code conventions and component patterns, prioritizing mobile-first usability throughout.