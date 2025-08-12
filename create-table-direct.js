// Script to create a table directly using Supabase client
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

async function createTableDirect() {
  try {
    // Try to create a simple table directly
    console.log('\nCreating a test table directly...');
    
    // First, check if the table exists
    const { data: existingData, error: existingError } = await supabase
      .from('direct_test_table')
      .select('*')
      .limit(1);
    
    if (existingError && existingError.code !== '42P01') { // 42P01 is the error code for table not found
      console.error('Error checking if table exists:', existingError);
    } else if (!existingError) {
      console.log('Table already exists:', existingData);
    } else {
      console.log('Table does not exist, creating it...');
      
      // Try to insert data into a non-existent table to see the error
      const { data: insertData, error: insertError } = await supabase
        .from('direct_test_table')
        .insert([{ name: 'Test' }]);
      
      if (insertError) {
        console.error('Error inserting data:', insertError);
      } else {
        console.log('Data inserted successfully:', insertData);
      }
    }
    
    // Try to use the SQL tag feature
    console.log('\nTrying SQL tag feature...');
    const { data: sqlData, error: sqlError } = await supabase
      .from('_supabase_functions')
      .select('*')
      .limit(1);
    
    if (sqlError) {
      console.error('Error using SQL tag:', sqlError);
    } else {
      console.log('SQL tag result:', sqlData);
    }
    
    // Try to access the User table
    console.log('\nTrying to access User table...');
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select('id, email')
      .limit(5);
    
    if (userError) {
      console.error('Error accessing User table:', userError);
    } else {
      console.log('User table data:', userData);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the creation
createTableDirect();