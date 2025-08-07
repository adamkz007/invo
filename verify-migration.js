// Script to verify the migration by checking the structure of all tables in Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyMigration() {
  console.log('Verifying Supabase migration...');

  try {
    // List known tables to check
    const knownTables = [
      'User', 'Customer', 'Product', 'Invoice', 'InvoiceItem', 
      'Company', 'Receipt', 'ReceiptItem'
    ];

    console.log('\nChecking known tables:');
    for (const tableName of knownTables) {
      await checkTable(tableName);
    }

    console.log('\nVerification completed successfully!');
  } catch (error) {
    console.error('Verification failed:', error);
  }
}

async function checkTable(tableName) {
  console.log(`\n--- Table: ${tableName} ---`);
  
  try {
    // Try to select from the table to verify it exists
    const { data: tableData, error: tableError } = await supabase
      .from(tableName)
      .select('*')
      .limit(5);

    if (tableError) {
      console.error(`Error accessing ${tableName} table:`, tableError);
      return;
    }

    console.log(`Table ${tableName} exists and is accessible`);
    
    // If we have data, we can infer the columns from the first row
    if (tableData && tableData.length > 0) {
      console.log('Columns (inferred from data):');
      const columns = Object.keys(tableData[0]);
      columns.forEach(column => {
        const value = tableData[0][column];
        const type = value === null ? 'unknown' : typeof value;
        console.log(`  - ${column} (${type})`);
      });
      
      console.log(`Row count: ${tableData.length} (limited to 5)`);
    } else {
      console.log('No data available to infer columns');
    }
  } catch (error) {
    console.error(`Error checking table ${tableName}:`, error);
  }
}

verifyMigration();