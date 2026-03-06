# Invo

Invo is a Malaysian invoicing and POS platform for freelancers and SMEs, built with Next.js 15.

## Current Product Scope

- Invoices with payments, PDF generation, and receipt generation
- Customer management with limits by subscription plan
- Inventory and product management (including stock-aware invoice flows)
- POS order workflows (tables, orders, status transitions, kitchen chit printing)
- Accounting module (ledger, accounts, expenses, bank import, tax rates, financial reports)
- Stripe subscription flows (checkout, portal, webhook handling)
- E-invoice readiness module (configuration, validation, invoice readiness checks)
- Marketing/blog pages, SEO structured data, and web-vitals endpoint
- PWA support via service worker + manifest

## Tech Stack

- Next.js 15 (App Router) + React 19 + TypeScript
- Prisma ORM (`@prisma/client` / Prisma 6)
- PostgreSQL/Supabase in production
- Tailwind CSS + shadcn/ui + Radix
- React Hook Form + Zod
- Stripe

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment variables (`.env.local`):

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY` (for subscription features)
- `STRIPE_PRICE_ID` (for subscription checkout)
- `STRIPE_WEBHOOK_SECRET` (for webhook verification)

3. Start development server:

```bash
npm run dev
```

## Common Commands

- `npm run dev` - Start local dev server
- `npm run build` - Generate Prisma client and build Next.js app
- `npm run lint` - Run ESLint
- `npm run analyze` - Build with bundle analyzer
- `npm run seed` - Push schema + seed data
- `npm run db:deploy` - Run Prisma deployment helper (`prisma/deploy.js`)
- `npm run test:db` - Database connection smoke test
- `npm run test:api` - API smoke test script

## Database and Migration Notes

- `prisma/schema.prisma` is the source of truth for models.
- Supabase SQL migrations live in `supabase/migrations`.
- Root-level migration helpers:
  - `node migrate-to-supabase.js`
  - `node sync-schema-migration.js`
  - `node migrate-pos-tables.js`
- Run `npm run test:db` before and after major schema changes.

## PWA

PWA support is wired through:

- `public/manifest.json`
- `public/sw.js`
- `src/components/providers/pwa-provider.tsx`

The app registers the service worker from the root layout and supports installable app behavior.

## Deployment

Netlify deployment is configured via `netlify.toml` with `@netlify/plugin-nextjs`.

- Build command: `npm run build`
- Publish directory: `.next`
- Ensure required environment variables are set in Netlify project settings.

## License

All rights reserved © Invo
