# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Invo is a Malaysian invoicing and POS application built for freelancers and SMEs. The application includes:
- Invoice management and customer relationship tracking
- POS system for restaurants with table management
- Accounting system with double-entry bookkeeping
- Progressive Web App (PWA) capabilities

## Architecture

**Tech Stack:**
- Next.js 15 (App Router) with TypeScript
- Prisma ORM with PostgreSQL (production via Supabase, local SQLite for development)
- Tailwind CSS + shadcn/ui components
- React Hook Form with Zod validation
- Stripe for subscription management

**Database Architecture:**
- Uses PostgreSQL in production (Supabase) and SQLite locally
- Database switching handled via `DATABASE_URL` environment variable
- Audit logging middleware for accounting models in `src/lib/prisma.ts:26`
- Migration scripts in root for syncing between local and production databases

**Key Directories:**
- `/src/app/(dashboard)/` - Protected dashboard routes (invoices, customers, POS, accounting)
- `/src/app/(auth)/` - Authentication pages
- `/src/app/api/` - API routes organized by domain
- `/src/components/` - Organized by feature (invoices, customers, pos, accounting)
- `/src/lib/` - Utilities, Prisma client, auth, PDF generation
- `/src/lib/data/` - Data access layer with typed query functions (invoices.ts, products.ts, etc.)
- `/src/lib/accounting/` - Double-entry accounting posting utilities
- `/src/contexts/` - React context providers (settings, etc.)
- `/prisma/` - Database schema and migrations

## Common Development Commands

**Development:**
- `npm run dev` - Start development server
- `npm run build` - Build for production (includes Prisma generation)
- `npm run lint` - Run ESLint
- `npm run analyze` - Build with bundle analyzer

**Database:**
- `npm run seed` - Seed local database with test data
- `npm run db:deploy` - Deploy Prisma schema changes to local database
- `npm run test:db` - Test database connection
- `npm run test:api` - Test API endpoints

**Migration Scripts:**
- `node migrate-to-supabase.js` - Migrate basic schema to Supabase
- `node sync-schema-migration.js` - Sync additional fields to Supabase
- `node migrate-pos-tables.js` - Migrate POS tables to Supabase

## Important Rules

**Database:**
- Always ask for explicit approval before resetting any database
- Test database connections with `npm run test:db` before major operations
- Use migration scripts when deploying schema changes to production

**Code Patterns:**
- Import via the `@/*` alias instead of deep relative paths
- API routes use Next.js 15 App Router conventions (`route.ts` files)
- API routes authenticate via `getUserFromRequest()` from `@/lib/auth`
- Cache invalidation uses `revalidateTag()` with user-scoped tags (e.g., `invoices:${userId}`)
- Client components are separated from server components (e.g., `dashboard-client.tsx`)
- Forms use React Hook Form with Zod validation schemas
- Database operations use Prisma with proper transaction handling in `prisma.$transaction()`
- Audit logging is automatically handled for accounting models
- Feature folders use kebab-case filenames (e.g., `invoice-form.tsx`), exported components use PascalCase

**UI/UX:**
- Uses shadcn/ui component library with custom Tailwind theme
- Dark mode support via `next-themes`
- Mobile-first responsive design
- PWA capabilities for offline usage
- Settings context (`useSettings()`) controls module visibility (POS, Receipts, Accounting)

## Deployment

Deploys to Netlify with automatic builds. Environment variables required:
- `DATABASE_URL` - Supabase connection string for production
- `JWT_SECRET` - For user authentication
- `NEXT_PUBLIC_APP_URL` - Base URL for the application
- Stripe keys for subscription management