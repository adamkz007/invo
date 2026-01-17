# Invo → Malaysia e-Invoice (LHDN MyInvois) + PEPPOL (BIS Billing 3.0) implementation plan

This document maps Malaysia e-Invoice issuance requirements (LHDN MyInvois) and PEPPOL (BIS Billing 3.0) requirements against the current Invo codebase, and lists what must be added for compliance.

## Sources (primary)

- LHDN MyInvois SDK (API docs): https://sdk.myinvois.hasil.gov.my/
- LHDN MyInvois e-Invoice APIs (submit/cancel/reject/search/etc): https://sdk.myinvois.hasil.gov.my/einvoicingapi/
- LHDN MyInvois “Submit Documents” (payload shape, base64, documentHash, codeNumber): https://sdk.myinvois.hasil.gov.my/einvoicingapi/02-submit-documents/
- LHDN MyInvois “Signature” (XAdES, certificate profile, RSA/SHA-256): https://sdk.myinvois.hasil.gov.my/signature/
- LHDN MyInvois FAQ (env URLs, token lifetime, field validations, hashing note): https://sdk.myinvois.hasil.gov.my/faq/
- LHDN MyInvois SDK release notes (validation changes, foreign currency exchange rate rule): https://sdk.myinvois.hasil.gov.my/sdk-1-0-release/
- PEPPOL BIS Billing 3.0 specification: https://docs.peppol.eu/poacc/billing/3.0/bis/
- PEPPOL BIS Billing 3.0 UBL Invoice syntax tree (CustomizationID/ProfileID defaults, element cardinalities): https://docs.peppol.eu/poacc/billing/3.0/syntax/ubl-invoice/tree/

## Current Invo snapshot (relevant parts)

**Data model (Prisma)**

- `Invoice` has header-level `taxRate`, `taxAmount`, `discountRate`, `discountAmount`, `total`, `paidAmount`, and a relation to `InvoiceItem`. No per-line tax model. (`prisma/schema.prisma`)
- `Customer` supports `registrationType`, `registrationNumber`, and `taxIdentificationNumber` fields. (`prisma/schema.prisma`)
- `Company` supports `registrationNumber`, `taxIdentificationNumber`, address fields (`street/city/postcode/state/country`), `msicCode`, and bank account fields. (`prisma/schema.prisma`)

**Invoice issuance workflow**

- Invoice creation calculates totals and stores a draft/sent/paid lifecycle. (`src/app/api/invoices/route.ts`, `src/app/api/invoices/[id]/route.ts`)
- Invoices are rendered as human-readable UI + downloadable PDF. (`src/app/(dashboard)/invoices/*`, `src/lib/pdf-generator.ts`)
- “Cancel invoice” exists as an internal status change and stock adjustment, not an LHDN cancellation. (`src/app/api/invoices/[id]/route.ts`)

**Important implication**

Invo today issues invoices as PDFs/records. Malaysia e-Invoice compliance requires issuing a structured, standards-based document (UBL 2.1 XML/JSON), applying a digital signature (XAdES), submitting to MyInvois for validation, persisting the returned IDs/status, and distributing a human-readable view that includes tax authority metadata (typically QR/validation link).

## What “LHDN compliant issuance” means (minimum)

Based on the MyInvois SDK:

1. Generate an e-Invoice document compliant with the supported document type/version (UBL 2.1-based payload as XML or JSON).
2. Digitally sign the document (XAdES enveloped signature for XML; JSON signature uses the SDK’s defined extension approach).
3. Base64-encode the signed document and compute a SHA-256 hash (`documentHash`) of the document.
4. Submit to `POST /api/v1.0/documentsubmissions/` with `format`, `document`, `documentHash`, and `codeNumber`.
5. Poll submission/document endpoints to obtain final validation results and store returned identifiers (submissionId, document IDs, long ID used for validation link) and status.
6. Support cancellation and buyer rejection flows via API (and keep internal invoice state in sync).

## What “PEPPOL compliant issuance” means (minimum)

Based on PEPPOL BIS Billing 3.0:

1. Produce PEPPOL-conformant UBL 2.1 invoice/credit note with the correct identifiers (`CustomizationID`, `ProfileID`) and required business terms (EN16931 + PEPPOL restrictions).
2. Provide correct party identifiers (Seller/Buyer endpoint/participant IDs, scheme IDs), tax categories, units of measure, totals, allowances/charges, etc.
3. Deliver over the PEPPOL network (typically via an Access Point provider integration), or at minimum export the validated XML for sending.

## Key mapping: requirements vs Invo today vs gaps

| Requirement area | LHDN / MyInvois expectation | PEPPOL expectation | Invo today | Gap / work needed |
|---|---|---|---|---|
| Structured document | UBL 2.1 XML/JSON document types/versions per SDK | UBL 2.1 with PEPPOL BIS customization | No UBL/JSON invoice export | Add UBL generation (LHDN variant + PEPPOL variant) |
| Digital signature | XAdES enveloped (RSA + SHA-256), certificate profile requirements | PEPPOL does not require XAdES for BIS itself, but delivery may require signing at transport layer (AS4) via Access Point | No signing | Add signing pipeline and secure certificate/key management |
| Submission to tax authority | OAuth/token + submit/poll/cancel/reject APIs | Not applicable | None | Add MyInvois API client, storage, and workflows |
| Identifiers returned by authority | Store submissionId, document IDs, long ID for validation link, status | Not applicable | None | Add persistence + surface in UI/PDF |
| Supplier identity | Supplier TIN/BRN and address/contacts with field constraints | Seller legal entity + VAT/tax scheme IDs + endpoint ID | Company has registrationNumber/taxIdentificationNumber + address | Add explicit TIN/BRN semantics, SST/TTX fields, validation and code lists |
| Buyer identity | Buyer TIN + ID types/values (B2B/B2C variants), optional email/phone rules | Buyer endpoint ID, legal entity, address | Customer has registrationType/registrationNumber/taxIdentificationNumber, address | Add PEPPOL endpoint IDs, enforce field constraints, add “general buyer” handling rules for consolidation where applicable |
| Item classification | SDK codes + required classifications for items where applicable | Item standard identifiers (optional) + unit codes required | Product only has name/description/sku | Add classification code fields and code lists; add unit of measure |
| Tax modeling | Typically line-level tax categories and tax breakdown; SDK includes tax exemption support | EN16931/PEPPOL tax categories and VAT breakdown rules | Header-level taxRate only | Add per-line tax category/rate/exemption + computed totals |
| Allowances/charges | Supported, with validations | Required modeling; totals must reconcile | Discount is header-level only | Add invoice-level + line-level allowances/charges and reconciliation rules |
| Currency | MYR default; foreign currency requires exchange rate element per SDK notes | Currency codes in UBL; VAT accounting currency constraints | AppSettings supports currency code; no exchange rates | Add exchange rate data model + UI and ensure UBL output includes it when needed |
| Lifecycle and state | MyInvois statuses: Submitted/Valid/Invalid/Cancelled; token lifetime; rate limits | PEPPOL delivery status managed by Access Point | Invo statuses: DRAFT/SENT/PAID/PARTIAL/OVERDUE/CANCELLED | Add e-Invoice status model separate from commercial invoice status |
| Cancellation/rejection | Cancel and reject APIs with business rules/time windows | Credit note/correction processes in PEPPOL | Internal cancel only | Implement MyInvois cancel/reject flow and map to internal actions; add credit/debit note support |
| Retention/auditability | Strong audit trail expectations; sandbox retention differs | Traceability through network | Basic DB storage | Add e-invoice event log, payload storage, and retention/export mechanisms |

## Proposed product behavior (user-facing)

### Issuing an LHDN e-Invoice from an Invo invoice

1. User creates invoice as usual (Draft).
2. User clicks “Submit to LHDN” (or “Mark as Sent” can optionally trigger submission if configured).
3. Invo validates required supplier/buyer/item fields for the chosen LHDN document type/version.
4. Invo generates UBL 2.1 payload for LHDN, signs it, hashes it, submits it to MyInvois.
5. UI shows status: Submitted → Valid/Invalid.
6. On Valid: Invo stores returned IDs, generates QR/validation link, and can embed it into the invoice PDF view.
7. On Invalid: show structured validation errors and allow user to fix data and resubmit (as a new submission; do not mutate the previously-submitted payload).

### Issuing a PEPPOL invoice

Options:

- **Export-only mode (fast path):** Generate PEPPOL BIS Billing 3.0 compliant UBL and let users send via their Access Point.
- **Full send mode (recommended):** Integrate with a PEPPOL Access Point provider API to send to recipients and receive delivery status.

## What needs to be added to Invo (implementation backlog)

### 1) Data model changes (Prisma)

Add an “e-invoice module” that is separate from the commercial invoice lifecycle.

Suggested new tables (names indicative):

- `EInvoiceConfig`
  - `companyId`
  - `enabled` (sandbox/prod toggles)
  - `myinvoisClientId`, `myinvoisClientSecret` (or reference to secrets storage)
  - `supplierTin`, `supplierBrn`
  - `supplierSstNumber`, `supplierTtxNumber` (if applicable)
  - `defaultDocumentCurrencyCode`
  - `defaultPaymentTerms`
- `EInvoiceDocument`
  - `invoiceId` (link to Invo invoice)
  - `documentType` (Invoice/CreditNote/DebitNote/RefundNote/SelfBilled…)
  - `documentVersion`
  - `format` (XML/JSON)
  - `canonicalDataSnapshot` (JSON snapshot of inputs used)
  - `signedPayloadBase64` (or store raw XML/JSON + generated hash)
  - `documentHash`
  - `submissionId`, `myinvoisDocumentId`, `myinvoisLongId`
  - `status` (Submitted/Valid/Invalid/Cancelled)
  - `validationErrors` (JSON)
  - timestamps
- `EInvoiceEvent`
  - `eInvoiceDocumentId`
  - `eventType` (SUBMITTED/VALIDATED/INVALID/CANCELLED/REJECTED/RETRIED)
  - `payload` (JSON)
  - timestamps

In addition, expand existing models:

- `Company`
  - Add explicit LHDN supplier identity fields if needed beyond current `registrationNumber/taxIdentificationNumber` (TIN vs “tax identification number” should be unambiguous in UI).
  - Add `sstRegistrationNumber`, `tourismTaxRegistrationNumber` if required by business type.
- `Customer`
  - Add PEPPOL endpoint identifiers (participant ID + scheme).
  - Add fields needed to reliably produce either LHDN or PEPPOL party structures (e.g., legal entity ID scheme, country code normalization).
- `Product` and/or `InvoiceItem`
  - Add `unitCode` (UNECE Rec 20) and optional “item classification” fields.
  - Add line-level tax category configuration if needed per item.

### 2) Core invoice calculation changes

To satisfy both LHDN and PEPPOL constraints, move from “single header tax rate” to “line-level tax and totals”.

Minimum:

- Each invoice line stores:
  - quantity, unit price, unit code
  - line net amount
  - tax category/type, tax rate
  - exemption reason/code if applicable
- Invoice totals:
  - line extension amount, tax exclusive inclusive totals
  - total tax amount, allowances/charges totals
  - rounding amount rules (if applicable)

### 3) UBL generation layer

Implement a UBL builder with two targets:

- **LHDN MyInvois UBL variant**
  - Must match the specific document type/version structures published by MyInvois.
  - Must embed signature extension for XML (XAdES) as required.
- **PEPPOL BIS Billing 3.0 UBL variant**
  - Must set required identifiers and obey PEPPOL/EN16931 business rules.

Important: do not assume one XML is valid for both ecosystems; treat them as separate “profiles” with their own validation pipelines.

### 4) Digital signature + certificate management (LHDN)

Per MyInvois “Signature” guidance:

- Support X.509 certificates and RSA SHA-256 signing.
- Create an enveloped XAdES signature inside the UBL document.
- Manage keys securely:
  - Store private keys encrypted at rest.
  - Restrict key access to server-only code paths.
  - Prefer integrating with a managed signing service/HSM if Invo is multi-tenant.

Implementation choices:

- **Option A (in-app signing):** Invo performs XML signing on the server.
- **Option B (intermediary):** Invo integrates with a certified intermediary/provider that signs and submits on behalf of users.

### 5) MyInvois API integration (LHDN)

Implement a server-side MyInvois client:

- Token management (cache token for its lifetime; avoid logging in too frequently).
- Endpoints typically needed:
  - Validate/Search TIN
  - Submit Documents
  - Get Submission + Get Document Details (poll results)
  - Cancel Document
  - Reject Document (buyer-side, if Invo supports receiving)
  - Search Documents / Get Document
- Respect rate limiting headers and implement retries with backoff.
- Persist all requests/responses for audit and debugging (redact secrets).

### 6) UI/UX changes

**Settings**

- Add an “e-Invoice (LHDN)” section:
  - MyInvois environment selection (Sandbox/Prod)
  - Client credentials (or connect flow)
  - Supplier TIN/BRN/SST/TTX fields
  - Certificate upload/management (or intermediary connection)
  - Default behaviors (auto-submit on “Mark sent”, etc.)

**Invoice form**

- Add fields needed to build compliant payloads:
  - Payment terms
  - Currency + exchange rate when currency ≠ MYR
  - Line unit code, classification code, tax category/exemption

**Invoice details**

- Show:
  - e-Invoice status (Submitted/Valid/Invalid/Cancelled)
  - MyInvois identifiers (submission id, document id, long id)
  - Validation errors with actionable guidance
  - A “Download e-Invoice XML/JSON” action

### 7) PDF changes (human-readable output)

After LHDN validation, update invoice PDF generation to optionally display:

- LHDN validation link / QR code derived from returned metadata.
- Tax authority identifiers (as required by the SDK/portal verification experience).

This should be conditional: invoices without a validated e-invoice should not show LHDN identifiers.

### 8) Operational concerns

- **Environments:** use different Client ID/Secret per sandbox/prod and route to the correct base URLs.
- **Idempotency:** prevent accidental duplicate submissions (store a stable “submission fingerprint” using invoice snapshot + UBL hash).
- **Observability:** store structured logs and events for support.
- **Data retention:** keep signed payloads and responses; offer export tooling (especially since sandbox data may be deleted by the platform).

## Suggested implementation sequence (fastest path)

1. Add data model + UI fields to capture required supplier/buyer/item data.
2. Implement LHDN UBL generation (XML) + XAdES signature + document hashing.
3. Integrate MyInvois submit + poll + store IDs/status + show in UI.
4. Add cancel flow (sync internal cancel ↔ MyInvois cancel) and resubmission behavior for invalid documents.
5. Add PEPPOL export: generate BIS Billing 3.0 UBL + validation tooling.
6. Integrate with a PEPPOL Access Point provider for full send/receive lifecycle.

## Concrete code touchpoints (where changes land)

- Invoice DB model and existing invoice workflow: `prisma/schema.prisma`, `src/app/api/invoices/route.ts`, `src/app/api/invoices/[id]/route.ts`
- Company and customer profile: `src/app/api/company/route.ts`, `src/app/(dashboard)/settings/page.tsx`, `prisma/schema.prisma`
- Invoice UI + PDF: `src/app/(dashboard)/invoices/*`, `src/lib/pdf-generator.ts`
- Currency settings: `src/lib/utils.ts`

## Detailed implementation plan (phased)

This plan is optimized for shipping compliant LHDN issuance first (sandbox → prod), then PEPPOL export, then full PEPPOL send via an Access Point.

### Phase 0 — Foundations (1–2 weeks)

**Goal:** create the “e-invoice module skeleton” without changing existing invoice behavior.

**Deliverables**

- Data model scaffolding for e-invoice configuration and per-invoice e-invoice documents/events.
- Server-side secret handling strategy (do not store raw secrets unencrypted in DB).
- Baseline validations and internal status model for e-invoice lifecycle.

**Key decisions**

- LHDN integration mode:
  - **In-app signing** (more control, harder security posture), or
  - **Intermediary/provider** (simpler security, vendor dependency).
- Document format:
  - Start with **XML** for LHDN because XAdES requirements are most mature/defined there.
- Where to run submission polling:
  - On-demand (UI-triggered refresh) initially, then background job/cron.

**Engineering tasks**

- Prisma changes:
  - Add `EInvoiceConfig`, `EInvoiceDocument`, `EInvoiceEvent` tables (names can vary).
  - Add enums for `EInvoiceEnvironment` (SANDBOX/PROD), `EInvoiceStatus` (SUBMITTED/VALID/INVALID/CANCELLED), `EInvoiceProfile` (LHDN/PEPPOL).
- API scaffolding:
  - `GET/PUT /api/einvoice/config` (load/update configuration).
  - `GET /api/invoices/:id/einvoice` (current e-invoice state).
- UI scaffolding:
  - Settings page: a disabled “E-Invoice (LHDN)” section behind feature flag.
  - Invoice details: placeholder “e-Invoice” panel with statuses.

**Acceptance criteria**

- No invoice flows break: create → mark sent → payment → cancel works as before.
- E-invoice module can be enabled per tenant without affecting others.

### Phase 1 — Capture mandatory data + validation (1–2 weeks)

**Goal:** collect all data needed to generate a valid LHDN UBL and a valid PEPPOL BIS UBL.

**Deliverables**

- Supplier identity fields in Settings and persisted in DB:
  - Supplier TIN, BRN, address fields normalized, optional SST/TTX.
  - MSIC code is already present but ensure it maps to what LHDN requires.
- Buyer identity fields in Customer:
  - Ensure buyer TIN + ID type/value capture is usable for B2B and B2C.
  - Add PEPPOL participant identifier + scheme.
- Line-level invoice fields:
  - Unit code (UNECE Rec 20), line tax category/rate, exemption metadata where applicable.

**Engineering tasks**

- Update `Company` and `Customer` models to remove ambiguity:
  - Rename or introduce explicit `tin`/`brn` fields instead of overloading `taxIdentificationNumber`/`registrationNumber`.
- Add `unitCode` to `Product` or `InvoiceItem` (prefer `InvoiceItem` so it’s snapshot-at-issuance).
- Add a line-level tax model:
  - Minimal: `InvoiceItem.taxRate`, `InvoiceItem.taxCategoryCode`, optional `taxExemptionReasonCode`, `taxExemptionReason`.
  - Recompute and persist `Invoice.taxAmount` based on line totals for backward compatibility.
- Implement validation functions (server-side) for:
  - Required seller/buyer fields and field constraints from MyInvois FAQ.
  - Date formatting and currency exchange-rate presence when currency != MYR (MyInvois release notes).

**Acceptance criteria**

- “Validate e-Invoice readiness” action on an invoice returns a complete list of missing/invalid fields.
- Validation errors are grouped by: supplier, buyer, invoice header, invoice line items.

### Phase 2 — LHDN UBL generator (XML) (1–3 weeks)

**Goal:** generate a MyInvois-compatible UBL 2.1 invoice XML from Invo invoice records.

**Deliverables**

- A deterministic “canonical invoice snapshot” builder (pure data) that feeds UBL generation.
- UBL XML generator for LHDN Invoice type/version(s) used in sandbox.

**Engineering tasks**

- Create a “canonical model” layer:
  - Convert DB models into a stable, versioned JSON structure (no UI formatting).
  - Include invoice header, seller, buyer, lines, taxes, totals, currency/exchange rate.
- Implement UBL serialization:
  - Start with required core elements and expand iteratively based on sandbox validation failures.
  - Keep profile-specific code in a dedicated module: `einvoice/lhdn/*`.
- Add export endpoint:
  - `GET /api/invoices/:id/einvoice/lhdn.xml` returns unsigned XML for debugging (feature-flagged).

**Acceptance criteria**

- Generated XML is stable: same invoice snapshot produces byte-identical output (important for hashing/signing).

### Phase 3 — Digital signature (XAdES) + hashing (1–3 weeks)

**Goal:** produce a signed UBL document and compute `documentHash` per MyInvois.

**Deliverables**

- XAdES enveloped signature insertion for UBL XML as per MyInvois “Signature”.
- SHA-256 hashing of the final submitted document and base64 encoding.

**Engineering tasks**

- Certificate/key handling:
  - Decide storage: encrypted DB blob, KMS, or integrate with a signing provider.
  - Add key rotation strategy and audit logging for certificate changes.
- Signing pipeline:
  - Take unsigned XML, apply canonicalization steps required by signing library, generate `<ds:Signature>` block under UBL extensions.
- Hashing:
  - Hash the exact payload that will be base64 encoded and submitted.
- Add “signature self-check” utilities:
  - Verify signature locally after signing (pre-submit).

**Acceptance criteria**

- Signed XML validates against MyInvois signature expectations in sandbox testing.
- `documentHash` matches what is submitted (no mismatches due to whitespace/canonicalization differences).

### Phase 4 — MyInvois authentication + submission (1–2 weeks)

**Goal:** submit signed documents to sandbox and persist submission + document identifiers.

**Deliverables**

- Token acquisition and caching (token validity is 60 minutes per MyInvois FAQ).
- Submit Documents integration:
  - Base64 document, `documentHash`, `codeNumber`, `format`.
- Storage of returned IDs and initial status.

**Engineering tasks**

- Implement a MyInvois API client:
  - Base URL selection (sandbox vs prod).
  - Token cache keyed by `clientId` + environment.
  - Rate-limit aware retry/backoff.
- New endpoint:
  - `POST /api/invoices/:id/einvoice/lhdn/submit`
  - Creates an `EInvoiceDocument` record tied to invoice snapshot/version.
  - Persists request/response metadata (redacted).
- Idempotency:
  - Refuse submit if same snapshot already submitted unless user explicitly “resubmit with changes”.

**Acceptance criteria**

- Submitting from UI creates an `EInvoiceDocument` in status SUBMITTED with stored submission/document IDs.
- Submissions are traceable with an event log.

### Phase 5 — Polling validation results + UI + PDF (1–2 weeks)

**Goal:** show final MyInvois validation (Valid/Invalid) and incorporate tax authority metadata into invoice output.

**Deliverables**

- Polling/refresh:
  - `GET /api/einvoice/documents/:id/refresh` fetches submission/doc details.
- UI presentation:
  - Show status, IDs, long ID, validation link, and structured errors.
- Optional PDF enhancements:
  - Display QR/validation URL and MyInvois identifiers only after Valid.

**Engineering tasks**

- Implement “Get Submission” + “Get Document Details” calls and map results to:
  - `EInvoiceDocument.status`
  - `validationErrors`
- Update invoice details screen to include:
  - Status chip
  - “Download e-Invoice XML”
  - “Refresh status”
- PDF generation:
  - Add fields in `pdf-generator.ts` to show LHDN validation metadata when present.

**Acceptance criteria**

- Invalid invoices display actionable errors and link back to fields to fix.
- Valid invoices show a verification link/QR in PDF and UI.

### Phase 6 — Cancellation + credit/debit notes (2–4 weeks)

**Goal:** implement compliance flows beyond the “happy path”.

**Deliverables**

- Cancel validated/submitted e-invoice via MyInvois Cancel Document API.
- Model correction documents:
  - Credit Note, Debit Note, Refund Note.

**Engineering tasks**

- Define business rules mapping:
  - Invo “Cancel invoice” must either:
    - Block if e-invoice is Valid and requires cancel-first, or
    - Trigger MyInvois cancel then set internal invoice CANCELLED when successful.
- Add correction document UI:
  - Create credit/debit note linked to original invoice and submit as a new e-invoice document type.

**Acceptance criteria**

- Cancelling an invoice that already has a Valid e-invoice results in a cancelled e-invoice record and consistent internal state.

### Phase 7 — PEPPOL BIS Billing 3.0 export (2–4 weeks)

**Goal:** generate PEPPOL BIS Billing 3.0 compliant UBL for export (no network sending yet).

**Deliverables**

- PEPPOL profile UBL generator (separate from LHDN).
- “Download PEPPOL XML” button for an invoice.

**Engineering tasks**

- Expand canonical invoice model to cover PEPPOL-required concepts:
  - Allowances/charges, line tax categories, payment means/terms, seller/buyer IDs.
- Emit UBL with required identifiers:
  - `CustomizationID` and `ProfileID` per BIS Billing 3.0 defaults.
- Add validation step:
  - Add a CI validation stage using official PEPPOL validation artifacts (integrate via a validator service or a library in a future implementation).

**Acceptance criteria**

- PEPPOL XML passes BIS Billing 3.0 validation tooling on representative test invoices (manual/CI).

### Phase 8 — PEPPOL send/receive (Access Point integration) (4–8+ weeks)

**Goal:** send invoices over PEPPOL and track delivery status.

**Deliverables**

- Integration with an Access Point provider (API credentials, endpoint discovery, sending, delivery receipts).
- Recipient discovery (SMP lookup) or provider-managed discovery.

**Engineering tasks**

- Add PEPPOL configuration:
  - Sender participant ID, certificate(s) managed by provider, SMP settings.
- Add delivery status model:
  - Outbound message IDs, timestamps, receipts, error payloads.

**Acceptance criteria**

- A PEPPOL invoice can be sent to a test participant and delivery receipt is tracked in UI.

## Implementation notes (how to fit this into current Invo architecture)

### Data ownership boundaries

- Keep commercial invoice lifecycle (`InvoiceStatus`) independent of e-invoice lifecycle (`EInvoiceStatus`).
- Store e-invoice documents as immutable snapshots:
  - If an invoice is edited after submission, require re-validation and submit as a new e-invoice document record.

### API surface (recommended)

- `GET/PUT /api/einvoice/config`
- `POST /api/invoices/:id/einvoice/lhdn/submit`
- `POST /api/einvoice/documents/:id/refresh`
- `POST /api/einvoice/documents/:id/cancel`
- `GET /api/invoices/:id/einvoice/lhdn.xml`
- `GET /api/invoices/:id/einvoice/peppol.xml`

### Security requirements

- Never log MyInvois client secret or private key material.
- Ensure signing happens only on the server (no client-side keys).
- Encrypt any stored key material at rest and restrict DB reads to server-only code paths.

## Test plan (what to automate)

Add e-invoice smoke tests as scripts (consistent with `src/scripts` approach in this repo):

- Generate LHDN XML from a seeded invoice and assert required elements exist.
- Sign XML and verify signature is present and hashing is stable.
- Mock MyInvois endpoints (or use sandbox env in a separate workflow) to verify submit + poll logic.
- Generate PEPPOL XML and validate it using official validator tooling (can be CI-only).

