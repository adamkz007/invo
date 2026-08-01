# Security Updates — OWASP Top Ten Hardening

## Executive Summary

Invo was hardened against OWASP Top Ten (2021) vulnerabilities through targeted fixes to authentication, access control, input validation, security headers, logging, dependency updates, and PWA caching. Changes are backward-compatible where possible; legacy SHA-256 password hashes are upgraded transparently on next login.

---

## OWASP Top Ten Mapping

| OWASP Category | Finding | Fix | File(s) |
|----------------|---------|-----|---------|
| **A01 — Broken Access Control** | Unauthenticated receipt IDOR | Auth + `userId` scoping on GET | `src/app/api/receipts/[id]/route.ts` |
| **A01** | Unauthenticated product image GET | Auth + `products/{userId}/` prefix validation | `src/app/api/uploads/product-image/[...path]/route.ts` |
| **A01** | POS cross-tenant inventory writes | `updateMany` with `userId` | `src/lib/pos-inventory.ts`, POS order routes |
| **A01** | Customer mass assignment | Explicit Zod allowlist on PUT/POST | `src/app/api/customers/[id]/route.ts`, `src/lib/schemas/customer.ts` |
| **A01** | Demo subscription bypass in production | 403 for `beta-upgrade` and `cus_sim_*` checkout | `src/app/api/subscription/beta-upgrade/route.ts`, `checkout/route.ts` |
| **A02 — Cryptographic Failures** | SHA-256 passwords | bcrypt (cost 10) with upgrade-on-login | `src/lib/password.ts`, `src/lib/auth.ts` |
| **A02** | Default JWT secret | Fail-fast in production via `getJwtSecret()` | `src/lib/env.ts`, `src/lib/auth.ts`, `src/middleware.ts` |
| **A02** | e-Invoice secret one-way hash | AES-256-GCM encryption | `src/lib/crypto.ts`, `src/app/api/einvoice/config/route.ts` |
| **A03 — Injection** | No server-side Zod validation | Shared schemas applied to POST/PUT handlers | `src/lib/schemas/*`, API routes |
| **A04 — Insecure Design** | TAC auto-provisioning | Require pre-registered phone; no auto-create | `src/app/api/auth/login/route.ts`, `request-tac/route.ts` |
| **A04** | Weak TAC generation | `crypto.randomInt()` + 5-attempt lockout | `src/lib/auth.ts` |
| **A05 — Security Misconfiguration** | Missing security headers | HSTS (prod), CSP-Report-Only, COOP, CORP | `next.config.ts` |
| **A05** | API cached in service worker | Network-only for `/api/*` | `public/sw.js` |
| **A05** | No CSRF mitigation | Origin/Referer validation on mutating API calls | `src/lib/csrf.ts`, `src/middleware.ts` |
| **A07 — Auth Failures** | No rate limiting | In-memory sliding window per IP/route | `src/lib/rate-limit.ts`, auth routes |
| **A07** | Password reset without current password | Require current password + fresh JWT | `src/app/api/auth/reset-password/route.ts` |
| **A08 — Software Integrity** | Stripe webhook replay | `ProcessedWebhookEvent` idempotency | `prisma/schema.prisma`, webhook route |
| **A08** | Vulnerable jspdf | Upgraded to latest 3.x | `package.json` |
| **A09 — Logging Failures** | TAC/cookie logging | Removed; gated behind `DEBUG_AUTH=true` | `src/lib/auth.ts`, auth UI/API |
| **A09** | Unvalidated web-vitals endpoint | Zod schema + rate limit + body cap | `src/app/api/observability/web-vitals/route.ts` |

---

## Breaking Changes / Migration Notes

1. **Password rehash** — Legacy SHA-256 hashes are upgraded to bcrypt automatically on next successful login. No user action required.
2. **TAC login** — Phone number must be registered before requesting a TAC. Unregistered numbers receive 404.
3. **TAC responses** — TAC codes are never returned in API responses (including development).
4. **Demo subscription routes** — `/api/subscription/beta-upgrade` and `cus_sim_*` checkout flow return 403 in production.
5. **Password reset** — Requires `currentPassword` in addition to `newPassword`.
6. **SVG uploads** — Rejected on product image upload; SVG paths blocked on GET.
7. **Prisma migration** — Run `npm run db:deploy` to add `ProcessedWebhookEvent` table.

---

## Environment Variables Checklist

| Variable | Required | Purpose |
|----------|----------|---------|
| `JWT_SECRET` | **Production** | Strong secret for JWT signing; app throws at startup if missing/placeholder |
| `EINVOICE_ENCRYPTION_KEY` | If e-Invoice used | 32-byte key, base64-encoded, for AES-256-GCM secret storage |
| `NEXT_PUBLIC_APP_URL` | **Production** (CSRF) | Origin validation for state-changing API requests |
| `STRIPE_WEBHOOK_SECRET` | Production | Stripe webhook signature verification |
| `DEBUG_AUTH` | Optional | Set to `true` to enable auth debug logging (never in production) |

Generate e-Invoice key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Manual QA Test Plan

- [ ] Login with legacy SHA-256 user → verify login succeeds; check DB hash starts with `$2`
- [ ] Login with new bcrypt user → verify login succeeds
- [ ] Request TAC for unregistered phone → expect 404
- [ ] Request TAC for registered phone → expect success (no TAC in response body)
- [ ] Enter wrong TAC 5 times → expect lockout message
- [ ] GET `/api/receipts/[id]` without auth → expect 401
- [ ] GET `/api/uploads/product-image/[other-user-path]` → expect 403
- [ ] Upload SVG product image → expect 400
- [ ] Upload valid PNG/JPEG → upload and view succeeds
- [ ] Complete POS order → inventory decrements only for own products
- [ ] POST `/api/subscription/beta-upgrade` in production → expect 403
- [ ] Reset password without current password → expect 400
- [ ] Reset password with wrong current password → expect 401
- [ ] Stripe webhook replay → second delivery skipped (duplicate response)
- [ ] PWA offline → pages cache; API responses not cached (check Network tab)
- [ ] Rate limit: 11 login attempts in 15 min → expect 429 with `Retry-After`

---

## Known Limitations

- **In-memory rate limiting** — Per-instance only; resets on cold start (Netlify serverless). Acceptable for current scale; consider Upstash Redis for multi-instance enforcement.
- **CSP report-only** — Content-Security-Policy is in report-only mode to avoid breaking Stripe/Next.js hydration. Promote to enforcing after manual QA.
- **CSRF origin check** — Relies on `Origin`/`Referer` headers; skipped in development when `NEXT_PUBLIC_APP_URL` is unset.
- **Legacy e-Invoice hashes** — Existing SHA-256 stored secrets cannot be decrypted; user must re-enter secret on next save to migrate to AES encryption.

---

## Future Recommendations

1. **Upstash Redis rate limiting** — Shared state across Netlify function instances
2. **Full CSP enforcement** — After report-only monitoring period
3. **bcrypt cost tuning** — Increase to 12 if login latency acceptable
4. **Session revocation table** — Invalidate all sessions on password change (currently issues fresh JWT only)
5. **Audit log review** — Periodic review of `AuditLog` entries for accounting models

---

## Files Created

- `src/lib/password.ts` — bcrypt + legacy SHA-256 verification
- `src/lib/env.ts` — JWT secret and e-Invoice key resolution
- `src/lib/rate-limit.ts` — In-memory sliding window rate limiter
- `src/lib/csrf.ts` — Origin validation for mutating API requests
- `src/lib/crypto.ts` — AES-256-GCM encrypt/decrypt for e-Invoice secrets
- `src/lib/api-error.ts` — Safe error responses (no stack traces in production)
- `src/lib/image-validation.ts` — Magic-byte validation for uploads
- `src/lib/schemas/` — Shared Zod schemas (customer, product, invoice, receipt, company)
- `src/lib/pos-inventory.ts` — User-scoped inventory decrement helper
- `security-updates.md` — This document

## Files Modified

- Auth: `src/lib/auth.ts`, auth API routes, `src/middleware.ts`, `prisma/seed.ts`
- Access control: receipts, uploads, customers, subscription routes
- Validation: customers, products, invoices, receipts, company API routes
- Defense: `next.config.ts`, `public/sw.js`, webhook route, e-invoice config
- Logging: `src/app/api/auth/me/route.ts`, `login-verification-form.tsx`
- Schema: `prisma/schema.prisma` (ProcessedWebhookEvent model)
