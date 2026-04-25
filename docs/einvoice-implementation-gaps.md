# e-Invoice Implementation Gaps (LHDN MyInvois)

## Summary
The current codebase has e-Invoice foundations (schema, settings, readiness checks, panel UI), but it is not yet capable of end-to-end submission to LHDN MyInvois.

## High-Priority Gaps

### 1) No backend submission endpoint or MyInvois API integration
Severity: Critical

Evidence:
- `src/app/api/invoices/[id]/einvoice/route.ts` only defines `GET` and no `POST`/`PATCH` for submit/status poll/cancel.
- `src/lib/einvoice/` contains constants/types/validation only; no API client for token retrieval and MyInvois document submission.

Impact:
- App cannot submit invoices to LHDN from Invo.
- No live document lifecycle (`SUBMITTED` -> `VALID`/`INVALID`) via authority responses.

Recommendation:
- Add MyInvois service layer in `src/lib/einvoice/` for:
  - OAuth token management
  - document submission
  - submission/document status polling
  - cancel/reject flows (as needed)
- Expose secure server endpoints (for example `POST /api/invoices/[id]/einvoice/submit`, `GET /api/invoices/[id]/einvoice/status`).

### 2) Submit button is UI placeholder only
Severity: Critical

Evidence:
- `src/components/invoices/einvoice-panel.tsx:100-106` has `handleSubmit()` showing an alert:
  - "E-Invoice submission will be available soon. This feature is under development."

Impact:
- Users see `Submit to LHDN`, but action does not perform real submission.
- High risk of misunderstanding production readiness.

Recommendation:
- Replace placeholder with API call to backend submit endpoint.
- Add clear disabled state/message until submission endpoint is available.

### 3) Client secret storage is one-way hash, not usable for outbound API authentication
Severity: Critical

Evidence:
- `src/app/api/einvoice/config/route.ts:77-85` hashes `myinvoisClientSecret` with SHA-256 and stores hash only.

Impact:
- Outbound MyInvois OAuth client-credential/token flows generally need the actual secret value.
- With hash-only storage, app cannot authenticate unless secret is re-entered each submission.

Recommendation:
- Store secret in reversible encrypted form (application-managed encryption key, KMS/secret manager, rotation strategy).
- Keep returning `hasClientSecret` to client, never raw value.

### 4) `Auto-submit on Send` setting is not wired to invoice send flow
Severity: High

Evidence:
- Setting exists in UI (`src/components/settings/einvoice-settings.tsx:510-530`) and persists in config API.
- `rg` usage shows no runtime logic that reads `autoSubmitOnSend` during `mark_sent` invoice action.
- `src/app/api/invoices/[id]/route.ts:185-204` sets status to `SENT` only.

Impact:
- User expectation mismatch; automation setting has no operational effect.

Recommendation:
- In `mark_sent` flow, if e-Invoice enabled + `autoSubmitOnSend` true:
  - queue submission job or trigger async submit service
  - store event/result in `EInvoiceDocument`/`EInvoiceEvent`

### 5) Readiness checks are basic and not fully aligned with comprehensive validation module
Severity: High

Evidence:
- API readiness uses simplified checks in `src/app/api/invoices/[id]/einvoice/route.ts:66+`.
- Rich validation exists in `src/lib/einvoice/validation.ts` but is not used in this API flow.

Impact:
- Potential false positives (`Ready`) for documents that may fail strict UBL/MyInvois validations.

Recommendation:
- Build canonical e-Invoice payload and run `validateEInvoiceData()` in readiness + submit preflight.
- Return structured validation codes/fields to UI for actionable fixes.

## Medium-Priority Gaps

### 6) No canonical payload generation + signing + hashing pipeline
Severity: Medium

Evidence:
- `EInvoiceDocument` schema includes snapshot/payload/hash fields, but no implemented generator/signer fills them during submit flow.

Impact:
- Missing compliance-critical artifact generation and traceability.

Recommendation:
- Add builder to map invoice/company/customer/items into canonical document payload.
- Generate deterministic hash and persist snapshot used for submission.
- Add signature pipeline if required by selected MyInvois document format/process.

### 7) No async job/retry model for submission lifecycle
Severity: Medium

Evidence:
- No queue/worker or retry logic around e-Invoice submission/polling.

Impact:
- Submission failures, transient errors, and polling requirements are hard to manage in request/response UI calls.

Recommendation:
- Add background job processing with retry and backoff.
- Persist each transition in `EInvoiceEvent`.

### 8) UI copy overstates current production behavior
Severity: Medium

Evidence:
- Production warning in settings says invoices submitted "will be sent to LHDN" (`src/components/settings/einvoice-settings.tsx:547-548`), while submit flow is not implemented.

Impact:
- Operational/compliance confusion.

Recommendation:
- Adjust copy to "submission integration under development" until actual submit endpoint is live.

## Suggested Implementation Sequence

1. Secure secret management (reversible encryption + migration path).
2. Backend MyInvois client + submit endpoint.
3. Wire `Submit to LHDN` button to endpoint and surface response states.
4. Add status polling + event trail updates.
5. Wire `autoSubmitOnSend` into `mark_sent` flow.
6. Replace basic readiness checks with canonical payload + full validation.
7. Add job queue and retry/backoff for production resilience.

## Acceptance Criteria (Minimum)
- User can click `Submit to LHDN` and get real submission response.
- `EInvoiceDocument` is created with submission identifiers and status updates.
- Validation errors from authority are surfaced in UI and persisted.
- `autoSubmitOnSend` actually triggers submission when enabled.
- Settings and UI copy accurately reflect feature readiness.
