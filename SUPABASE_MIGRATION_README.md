# Supabase Migration Guide

## Issue

When running the `migrate-to-supabase.js` script, you may encounter the following error:

```
Error updating User table: {
  code: 'PGRST202',
  details: 'Searched for the function public.execute_sql with parameter sql or with a single unnamed json/jsonb parameter, but no matches were found in the schema cache.',
  hint: null,
  message: 'Could not find the function public.execute_sql(sql) in the schema cache'
}
```

This error occurs because the migration script is trying to use a PostgreSQL function called `execute_sql` that doesn't exist in your Supabase database.

## Solution

To fix this issue, you need to create the `execute_sql` function in your Supabase database. Follow these steps:

### Step 1: Create the Execute SQL Function

Run the following command to get instructions on how to create the function:

```bash
node create-supabase-function.js
```

This will display instructions for creating the function in the Supabase dashboard.

### Step 2: Follow the Instructions

1. Log in to your Supabase dashboard at https://app.supabase.com/
2. Select your project
3. Go to the SQL Editor (left sidebar)
4. Click "New Query"
5. Copy and paste the SQL from the instructions into the editor
6. Click "Run" to execute the SQL

### Step 3: Run the Migration Script

After creating the function, you can run the migration script:

```bash
node migrate-to-supabase.js
```

## What the Function Does

The `execute_sql` function allows the migration script to execute raw SQL statements in your Supabase database. This is necessary for altering tables and performing other schema modifications that aren't directly supported by the Supabase JavaScript client.

## Security Considerations

The `execute_sql` function is created with `SECURITY DEFINER`, which means it runs with the privileges of the user who created it. This is necessary for the function to have the permissions needed to modify the database schema.

The function is granted to the `authenticated` and `service_role` roles, which means it can be called by authenticated users and by the service role (which is used by the migration script).