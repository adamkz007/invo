# Repository Guidelines

## Product Context
Invo is a Malaysian invoicing and POS platform for freelancers and SMEs. The current app includes invoice and customer management, receipts, inventory, POS order handling (including kitchen chit printing), double-entry accounting with financial reports, Stripe-based subscriptions, and e-invoice flows. The project also ships marketing/blog pages, SEO structured data, and PWA support (manifest + service worker).

## Project Structure & Module Organization
The Next.js 15 app lives in `src/app`, with route groups like `(auth)` and `(dashboard)` plus marketing pages. Domain APIs are under `src/app/api` (invoices, customers, receipts, products/inventory, POS, accounting, subscription, auth, e-invoice, observability). Shared UI lives in `src/components` (feature-grouped folders), context providers in `src/contexts`, and utilities in `src/lib` (including `src/lib/data`, `src/lib/accounting`, and `src/lib/einvoice`). Data definitions and seeds are in `prisma/`, Supabase SQL migrations in `supabase/migrations`, and migration/sync scripts at the repository root. Static assets are in `public/`, with reusable scripts in `scripts/` and `src/scripts`.

## Build, Test, and Development Commands
Use `npm run dev` for local development. `npm run build` runs `prisma generate` against local SQLite (`DATABASE_URL="file:./prisma/dev.db"`) before compiling the production bundle; keep it green before merging. `npm run lint` applies Next.js ESLint rules, and `npm run analyze` runs a bundle-analyzed build. Seed shared data with `npm run seed` (`prisma db push` + `prisma/seed.ts`), deploy schema updates with `npm run db:deploy` (via `prisma/deploy.js`, which runs `prisma generate` then `prisma db push --accept-data-loss`), and rely on `npm run test:db` plus `npm run test:api` for backend smoke checks.

Useful schema sync scripts (root): `node migrate-to-supabase.js`, `node sync-schema-migration.js`, and `node migrate-pos-tables.js`.

## Database & Safety Rules
Production uses PostgreSQL (Supabase) while local development uses SQLite, switched via `DATABASE_URL`. Always run `npm run test:db` before major database operations. Do not reset databases without explicit approval. When changing schema that affects production, include the relevant migration scripts/SQL and verification steps in your PR.

## Coding Style & Naming Conventions
The codebase uses strict TypeScript; add explicit types for shared utilities and context values. Import via the `@/*` alias instead of deep relative paths. Feature folders favour kebab-case filenames (for example `invoice-form.tsx`) while exported components remain PascalCase. Tailwind CSS handles styling; define tokens in `src/app/globals.css` and keep class composition close to the component. Two-space indentation and ESLint (`npm run lint`) keep formatting consistent; resolve warnings before opening a PR.

Follow implemented patterns:
- App Router API handlers live in `route.ts` files.
- Authenticate API routes with `getUserFromRequest()` from `@/lib/auth`.
- Use user-scoped cache tags with `revalidateTag()` where applicable.
- Keep client/server boundaries explicit (for example `*-client.tsx` patterns).
- Forms use React Hook Form + Zod.
- Use `prisma.$transaction()` for multi-step writes that must stay atomic.
- Audit logging middleware in `src/lib/prisma.ts` applies to accounting/auditable models.
- `useSettings()` controls module visibility and related feature toggles.

## UI/UX Conventions
UI uses Tailwind + shadcn/ui components with `next-themes` for theming and mobile-first responsive behavior. PWA support is active via `PWAProvider`, `public/manifest.json`, and `public/sw.js`. Preserve these patterns when extending dashboard flows.

## Testing Guidelines
Tests currently live as TypeScript scripts under `src/scripts`. Extend `test-db.ts` for Prisma checks and `test-api.ts` for HTTP flows, or add additional `test-*.ts` files that run via `ts-node`. After schema work, run `npm run db:deploy` followed by `npm run test:db`; for API work run both test scripts. No formal coverage target exists, but new logic should include either automated verification or documented manual QA steps.

## Deployment & Environment
Deploys to Netlify (`netlify.toml` includes `@netlify/plugin-nextjs`). Required environment variables include `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL`; Stripe-enabled flows also require `STRIPE_SECRET_KEY`, `STRIPE_PRICE_ID`, and webhook secret configuration for `/api/subscription/webhook`.

## Commit & Pull Request Guidelines
Commit history favours short, imperative titles (for example `fix login with Clerk`, `Update schema.prisma`). Keep each commit focused and include migration files or generated SQL when relevant. Pull requests should explain the change, link any issues, list the commands you ran, and attach UI screenshots whenever you touch visible pages. Call out new environment variables or Supabase requirements so reviewers can validate the flow end-to-end.
