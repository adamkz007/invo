// Script to check Supabase permissions
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Service Key (first 10 chars):', supabaseKey.substring(0, 10) + '...');

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function checkPermissions() {
  try {
    // Try to get the current user
    console.log('\nChecking authentication...');
    const { data: authData, error: authError } = await supabase.auth.getUser();

    if (authError) {
      console.error('Authentication error:', authError);
    } else {
      console.log('Authentication successful:', authData);
    }

    // Try to execute a simple SQL query
    console.log('\nExecuting a simple SQL query...');
    const { data: queryData, error: queryError } = await supabase.rpc('execute_sql', {
      sql: 'SELECT current_user, current_database();'
    });

    if (queryError) {
      console.error('Query error:', queryError);
    } else {
      console.log('Query result:', queryData);
    }

    // Try to create a simple test table
    console.log('\nTrying to create a test table...');
    const { data: createData, error: createError } = await supabase.rpc('execute_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS test_permissions (
          id SERIAL PRIMARY KEY,
          name TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `
    });

    if (createError) {
      console.error('Create table error:', createError);
    } else {
      console.log('Test table created successfully');

      // Check if the table was created
      const { data: checkData, error: checkError } = await supabase.rpc('execute_sql', {
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'test_permissions'
        ) as table_exists;`
      });

      if (checkError) {
        console.error('Check table error:', checkError);
      } else {
        console.log('Check table result:', checkData);
      }
    }

    // Try to list all tables in the public schema
    console.log('\nListing all tables in public schema...');
    const { data: tablesData, error: tablesError } = await supabase.rpc('execute_sql', {
      sql: `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';`
    });

    if (tablesError) {
      console.error('List tables error:', tablesError);
    } else {
      console.log('Tables in public schema:', tablesData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkPermissions();