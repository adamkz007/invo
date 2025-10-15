# Invo - Modern Invoicing for Malaysian Freelancers & SMEs

Invo is a simple, practical invoicing solution designed specifically for Malaysian small businesses and freelancers.

## Features

- **Simple Invoicing**: Create professional invoices in seconds
- **Customer Relationships**: Keep track of all your clients in one place
- **Business Insights**: See how your business is performing with easy-to-understand charts
- **Time-Saving Tools**: Set up recurring invoices and automated reminders
- **Work Anywhere**: Access your business from your phone, tablet, or computer
- **POS System**: Manage restaurant tables and orders with our integrated POS system

## PWA Support

Invo is now a Progressive Web App (PWA), which means it can be installed on your device and used offline. Features include:

- **Installable**: Add Invo to your home screen for quick access
- **Offline Support**: Continue working even without an internet connection
- **App-like Experience**: Full-screen mode without browser UI elements
- **Automatic Updates**: Always get the latest version

To install Invo on your device:
1. Open the website in a compatible browser (Chrome, Edge, Safari, etc.)
2. Look for the "Add to Home Screen" or "Install" option in your browser
3. Follow the prompts to install

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS
- Framer Motion

## Database Migrations

Invo uses Prisma for local development and Supabase in production. To keep the databases in sync, we have several migration scripts:

- `npm run db:deploy` - Deploy Prisma schema changes to the local database
- `node migrate-to-supabase.js` - Migrate the basic schema to Supabase
- `node sync-schema-migration.js` - Sync additional fields to Supabase
- `node migrate-pos-tables.js` - Migrate POS tables to Supabase

When adding new POS tables or modifying existing ones, make sure to run the appropriate migration scripts.

## Deployment

- **Netlify**: The repository includes a `netlify.toml` that installs `@netlify/plugin-nextjs` and publishes the `.next` build output. Set the Netlify build command to `npm run build` (default) and ensure environment variables like `DATABASE_URL`, `JWT_SECRET`, and `NEXT_PUBLIC_APP_URL` are configured. The plugin handles routing so marketing and dashboard routes resolve correctly.

## License

All rights reserved © Invo
