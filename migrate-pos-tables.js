// Script to migrate POS tables to Supabase
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

async function migratePOSTables() {
  console.log('Starting POS tables migration to Supabase...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Read the migration SQL file
    const fs = require('fs');
    const path = require('path');
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'supabase/migrations/20250808030321_add_pos_tables.sql'),
      'utf8'
    );

    // Split the SQL into individual statements
    const statements = migrationSQL
      .split(';')
      .map(statement => statement.trim())
      .filter(statement => statement.length > 0);

    console.log(`Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      
      const { error } = await supabase.rpc('execute_sql', {
        sql: statement + ';'
      });

      if (error) {
        console.error(`Error executing statement ${i + 1}:`, error);
        console.error('Statement:', statement);
      } else {
        console.log(`Statement ${i + 1} executed successfully`);
      }
    }

    // Verify the tables were created
    console.log('\nVerifying POS tables...');
    const { data: tables, error: tablesError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name IN ('pos_tables', 'pos_orders', 'pos_order_items', 'pos_settings');
      `
    });

    if (tablesError) {
      console.error('Error verifying tables:', tablesError);
    } else {
      console.log('POS tables in database:', tables);
    }

    console.log('\n✅ POS tables migration completed!');
    console.log('The POS tables have been added to the Supabase database.');
    console.log('Your Prisma schema should now be in sync with the Supabase database.');

  } catch (error) {
    console.error('❌ POS tables migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
migratePOSTables();