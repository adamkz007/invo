// Script to query Supabase using REST API
require('dotenv').config();
const fetch = require('node-fetch');

// Supabase connection URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

async function querySupabaseRest() {
  try {
    // Create a simple table using REST API
    console.log('\nCreating a test table using REST API...');
    
    const createTableResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS rest_test_table (
            id SERIAL PRIMARY KEY,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `
      })
    });

    const createTableResult = await createTableResponse.json();
    console.log('Create table response status:', createTableResponse.status);
    console.log('Create table result:', createTableResult);

    // Check if the table was created
    console.log('\nChecking if the table was created...');
    const checkTableResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'rest_test_table'
        ) as table_exists;`
      })
    });

    const checkTableResult = await checkTableResponse.json();
    console.log('Check table response status:', checkTableResponse.status);
    console.log('Check table result:', checkTableResult);

    // List all tables in the public schema
    console.log('\nListing all tables in public schema...');
    const listTablesResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
      })
    });

    const listTablesResult = await listTablesResponse.json();
    console.log('List tables response status:', listTablesResponse.status);
    console.log('List tables result:', listTablesResult);

    // Try to create the pos_tables table
    console.log('\nCreating pos_tables table...');
    const createPosTableResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql: `
          CREATE TABLE IF NOT EXISTS "pos_tables" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "label" TEXT,
            "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
            "capacity" INTEGER NOT NULL DEFAULT 4,
            "positionX" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "positionY" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "userId" TEXT NOT NULL,
            
            CONSTRAINT "pos_tables_pkey" PRIMARY KEY ("id")
          );
        `
      })
    });

    const createPosTableResult = await createPosTableResponse.json();
    console.log('Create pos_tables response status:', createPosTableResponse.status);
    console.log('Create pos_tables result:', createPosTableResult);

    // Check if pos_tables was created
    console.log('\nChecking if pos_tables was created...');
    const checkPosTableResponse = await fetch(`${supabaseUrl}/rest/v1/rpc/execute_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'pos_tables'
        ) as table_exists;`
      })
    });

    const checkPosTableResult = await checkPosTableResponse.json();
    console.log('Check pos_tables response status:', checkPosTableResponse.status);
    console.log('Check pos_tables result:', checkPosTableResult);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the query
querySupabaseRest();