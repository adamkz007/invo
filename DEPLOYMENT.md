# Deployment Checklist

## Supabase Setup

- [ ] Create a Supabase account at https://supabase.com/
- [ ] Create a new Supabase project
- [ ] Note your Supabase URL from Project Settings > API
- [ ] Note your Supabase anon key from Project Settings > API
- [ ] Note your PostgreSQL connection string from Project Settings > Database > Connection String > URI

## Environment Variables

- [ ] Set up the following environment variables in your local `.env.local` file for development:

```
# Database connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[YOUR-SUPABASE-ANON-KEY]

# Authentication
JWT_SECRET=[GENERATE-A-SECURE-RANDOM-STRING]

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Vercel Deployment

- [ ] Create a Vercel account at https://vercel.com/
- [ ] Push your code to a GitHub repository
- [ ] Import your GitHub repository in Vercel
- [ ] Configure the same environment variables in Vercel's project settings
- [ ] Deploy your application
- [ ] After deployment, run database migrations by visiting:
      `https://[YOUR-VERCEL-APP-URL].vercel.app/api/db/setup`

## Post-Deployment Verification

- [ ] Verify that the application loads correctly
- [ ] Test user registration and login
- [ ] Create a test customer
- [ ] Create a test product
- [ ] Create a test invoice
- [ ] Verify that all features are working as expected

## Troubleshooting

If you encounter any issues during deployment:

1. Check Vercel build logs for errors
2. Verify that all environment variables are correctly set
3. Check Supabase database logs for any database-related issues
4. Ensure that your Supabase project has the correct permissions set up
5. If database migrations fail, you may need to manually run them:
   - Clone your repository locally
   - Set up the environment variables
   - Run `npx prisma migrate deploy` 