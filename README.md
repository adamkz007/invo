# Invo - Invoice Management Application

A modern invoice management application built with Next.js.

## Local Development

1. Clone the repository
2. Install dependencies
```bash
npm install
```

3. Set up your environment variables
```bash
# Copy the example env file
cp .env.example .env.local
# Edit the environment variables
```

4. Start the development server
```bash
npm run dev
```

## Deploying to Vercel

### Prerequisites
- A PostgreSQL database (You can use Supabase, Railway, Neon, or Vercel Postgres)
- A Vercel account

### Setup Instructions

1. **Create a PostgreSQL Database**
   - Sign up for a PostgreSQL service like [Supabase](https://supabase.com) or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
   - Create a new database
   - Get the connection string

2. **Configure Environment Variables in Vercel**
   - Go to your Vercel project dashboard
   - Navigate to "Settings" > "Environment Variables"
   - Add the following environment variables:
     ```
     DATABASE_URL=your_postgresql_connection_string
     JWT_SECRET=a_strong_random_string
     NEXT_PUBLIC_APP_URL=your_vercel_deployment_url
     ```

3. **Deploy Your Project**
   - Push your code to GitHub
   - Import your repository in Vercel
   - Vercel will automatically build and deploy your project

4. **Troubleshooting Database Issues**
   - If you encounter database connection errors, ensure your database connection string is correct
   - Check that your database is accessible from Vercel's servers
   - Verify that the schema has been correctly deployed using the `db:deploy` script

## Features

- Create and manage invoices
- Track customer information
- Manage inventory and products
- Generate invoice PDFs
- User authentication and authorization
- Company profile management

## Tech Stack

- Next.js 15
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- Lucide Icons
- React Hook Form
- Zod validation

## License

MIT
