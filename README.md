# Invo - Invoice Management System

A modern invoice management system built with Next.js 15, Supabase, and Prisma.

## Features

- User authentication with phone number verification
- Customer management
- Product inventory
- Invoice creation and management
- Company profile management
- Responsive design for mobile and desktop

## Tech Stack

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: Supabase Auth
- **ORM**: Prisma
- **Deployment**: Vercel

## Deployment Instructions

### Prerequisites

- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account
- Node.js and npm installed locally

### Step 1: Set up Supabase

1. Create a new Supabase project
2. Note your Supabase URL and anon key from the project settings
3. The database schema will be automatically created by Prisma during deployment

### Step 2: Deploy to Vercel

1. Fork or clone this repository to your GitHub account
2. Connect your GitHub repository to Vercel
3. Configure the following environment variables in Vercel:

```
# Database connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]

# Authentication
JWT_SECRET=[GENERATE-A-SECURE-RANDOM-STRING]

# Application URL
NEXT_PUBLIC_APP_URL=https://[YOUR-VERCEL-APP-URL].vercel.app
```

4. Deploy your application
5. After deployment, run the database migrations by visiting:
   `https://[YOUR-VERCEL-APP-URL].vercel.app/api/db/setup`

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## License

[MIT](LICENSE)
