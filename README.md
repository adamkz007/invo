# Invo - Invoice Management System

A modern invoice management system built with Next.js, Prisma, and PostgreSQL.

## Features

- Customer management
- Product inventory
- Invoice generation and PDF export
- Dashboard with business analytics
- User authentication and authorization
- Responsive design for all devices

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS, shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL (Supabase)
- **ORM**: Prisma
- **Authentication**: JWT
- **PDF Generation**: jsPDF

## Getting Started

### Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file with the following variables:
     ```
     DATABASE_URL="file:./dev.db"
     JWT_SECRET="your-development-jwt-secret"
     NEXT_PUBLIC_APP_URL="http://localhost:3000"
     ```
4. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment

#### Prerequisites

- Vercel account
- Supabase account

#### Steps

1. Create a Supabase project and get your PostgreSQL connection string
2. Set up environment variables in Vercel:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `JWT_SECRET`: A secure random string for JWT token signing
   - `NEXT_PUBLIC_APP_URL`: Your Vercel deployment URL
3. Deploy to Vercel:
   ```bash
   vercel
   ```
4. For production deployment:
   ```bash
   vercel --prod
   ```

## Database Migrations

The application uses Prisma for database migrations. When deploying to production, migrations will be automatically applied during the build process.

## License

MIT
