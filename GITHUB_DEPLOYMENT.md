# GitHub + Netlify Deployment Guide

This project is designed for GitHub source control and Netlify hosting.

## 1. Push Repository to GitHub

If the GitHub repository does not exist yet:

1. Create an empty GitHub repository.
2. Push this local repo:

```bash
git remote add origin https://github.com/<your-org-or-user>/<repo>.git
git branch -M main
git push -u origin main
```

For existing repos, just commit and push your changes as usual.

## 2. Connect GitHub Repo to Netlify

1. In Netlify, choose `Add new site` -> `Import an existing project`.
2. Select GitHub and authorize access.
3. Choose the repository.

## 3. Netlify Build Configuration

This repo already includes `netlify.toml` with `@netlify/plugin-nextjs`.

- Build command: `npm run build`
- Publish directory: `.next`
- Plugin: `@netlify/plugin-nextjs`

Do not use GitHub Pages for this app; Next.js server features and API routes require a Next-capable host (Netlify/Vercel).

## 4. Required Environment Variables

Set these in Netlify project settings:

- `DATABASE_URL`
- `JWT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_WEBHOOK_SECRET`

Add any Supabase-specific secrets your environment requires.

## 5. Post-Deploy Validation Checklist

- Open `/login` and verify auth works.
- Create a test customer and invoice.
- Verify `/api/dashboard` returns expected data.
- Verify subscription routes (`/api/subscription/checkout`, webhook endpoint) are configured.
- Verify PWA assets load (`/manifest.json`, `/sw.js`).

## 6. Recommended Release Flow

1. Run local checks before push:

```bash
npm run lint
npm run build
npm run test:db
npm run test:api
```

2. Open PR with:
- Summary of changes
- Database/migration notes
- Env var changes (if any)
- Screenshots for UI changes
