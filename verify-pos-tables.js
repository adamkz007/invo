// Script to verify POS tables in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseKey) {
  console.error('SUPABASE_SERVICE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function verifyPOSTables() {
  console.log('Verifying POS tables in Supabase...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Check if tables exist
    console.log('\nChecking if POS tables exist...');
    const { data: tables, error: tablesError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('pos_tables', 'pos_orders', 'pos_order_items', 'pos_settings');
      `
    });
    
    console.log('Raw tables data:', JSON.stringify(tables, null, 2));

    if (tablesError) {
      console.error('Error checking tables:', tablesError);
    } else {
      // Try a different query to check if tables exist
      console.log('\nTrying alternative query to check tables...');
      const { data: tableCheck, error: tableCheckError } = await supabase.rpc('execute_sql', {
        sql: `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' AND table_name = 'pos_tables'
        ) as table_exists;`
      });
      
      console.log('Table check result:', JSON.stringify(tableCheck, null, 2));
      
      if (tableCheckError) {
        console.error('Error checking table existence:', tableCheckError);
      } else if (tableCheck && tableCheck.length > 0 && tableCheck[0].table_exists) {
        console.log('✅ pos_tables table exists in the database');
      } else {
        console.log('❌ pos_tables table does not exist in the database');
      }
      
      if (tables && tables.length > 0) {
        console.log('POS tables found:', tables.map(t => t.table_name).join(', '));
      } else {
        console.log('No POS tables found in the database using the first query.');
      }
    }

    // Check pos_tables structure
    console.log('\nChecking pos_tables structure...');
    const { data: posTableColumns, error: posTableColumnsError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'pos_tables' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (posTableColumnsError) {
      console.error('Error checking pos_tables structure:', posTableColumnsError);
    } else {
      if (posTableColumns && posTableColumns.length > 0) {
        console.log('pos_tables columns:');
        posTableColumns.forEach(col => {
          console.log(`  ${col.column_name}: ${col.data_type} ${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
        });
      } else {
        console.log('No columns found for pos_tables.');
      }
    }

    // Check if the id column exists in pos_tables
    const idColumn = posTableColumns ? posTableColumns.find(col => col.column_name === 'id') : null;
    if (idColumn) {
      console.log('\n✅ id column exists in pos_tables');
    } else {
      console.error('\n❌ id column is missing from pos_tables!');
    }

    console.log('\nVerification completed!');
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  }
}

// Run the verification
verifyPOSTables();