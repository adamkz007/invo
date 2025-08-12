// Script to check Supabase connection and RPC capabilities
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseConnection() {
  console.log('Checking Supabase connection...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Check if we can connect to Supabase
    const { data: healthCheck, error: healthError } = await supabase.from('_rpc').select('*');
    
    if (healthError) {
      console.error('Error connecting to Supabase:', healthError);
    } else {
      console.log('Successfully connected to Supabase');
    }

    // Check if execute_sql RPC function exists
    console.log('\nChecking if execute_sql RPC function exists...');
    const { data: rpcCheck, error: rpcError } = await supabase.rpc('execute_sql', {
      sql: 'SELECT 1 as test;'
    });

    if (rpcError) {
      console.error('Error executing RPC function:', rpcError);
      
      // Check if we can access any tables
      console.log('\nTrying to access tables directly...');
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5);

      if (tablesError) {
        console.error('Error accessing tables:', tablesError);
      } else {
        console.log('Tables found:', tables);
      }
      
    } else {
      console.log('execute_sql RPC function exists and works properly');
      console.log('RPC result:', rpcCheck);
    }

    // Try to list all tables in the public schema
    console.log('\nListing tables in public schema...');
    const { data: tablesList, error: tablesListError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');

    if (tablesListError) {
      console.error('Error listing tables:', tablesListError);
    } else {
      console.log('Tables in public schema:', tablesList);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the check
checkSupabaseConnection();