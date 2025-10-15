# Repository Guidelines

## Project Structure & Module Organization
The Next.js 15 app lives in `src/app`, with route groups like `(auth)` and `(dashboard)` alongside marketing pages. Shared UI sits in `src/components`, context providers in `src/contexts`, utilities in `src/lib`, and shared types in `src/types`. Data definitions and seeds reside under `prisma/`, while Supabase SQL migrations are tracked in `supabase/migrations`. Static assets are in `public/`, and reusable maintenance scripts stay at the repository root and inside `scripts/`.

## Build, Test, and Development Commands
Use `npm run dev` for local development, making sure `.env.local` provides `DATABASE_URL` that points to the Supabase Postgres instance (include `?sslmode=require` in the connection string). `npm run build` runs `prisma generate` before compiling the production bundle; keep it green before merging. `npm run lint` applies the Next.js ESLint rules. Seed shared data with `npm run seed`, deploy schema updates with `npm run db:deploy`, and rely on `npm run test:db` plus `npm run test:api` for backend smoke checks—each command now targets Supabase directly.

## Coding Style & Naming Conventions
The codebase uses strict TypeScript; add explicit types for shared utilities and context values. Import via the `@/*` alias instead of deep relative paths. Feature folders favour kebab-case filenames (for example `invoice-form.tsx`) while exported components remain PascalCase. Tailwind CSS handles styling; define tokens in `src/app/globals.css` and keep class composition close to the component. Two-space indentation and ESLint (`npm run lint`) keep formatting consistent—resolve warnings before you open a PR.

## Testing Guidelines
Tests currently live as TypeScript scripts under `src/scripts`. Extend `test-db.ts` for Prisma checks and `test-api.ts` for HTTP flows, or add additional `test-*.ts` files that run via `ts-node`. After schema work, run `npm run db:deploy` followed by `npm run test:db`; for API work run both test scripts. No formal coverage target exists, but new logic should include either automated verification or documented manual QA steps.

## Commit & Pull Request Guidelines
Commit history favours short, imperative titles (for example `fix login with Clerk`, `Update schema.prisma`). Keep each commit focused and include migration files or generated SQL when relevant. Pull requests should explain the change, link any issues, list the commands you ran, and attach UI screenshots whenever you touch visible pages. Call out new environment variables or Supabase requirements so reviewers can validate the flow end-to-end.
