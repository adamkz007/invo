// Script to create POS tables in Supabase
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

async function createPOSTables() {
  console.log('Creating POS tables in Supabase...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Create a simple POS table
    console.log('\nCreating pos_tables table...');
    const createTableSQL = `
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
    `;

    const { data: createResult, error: createError } = await supabase.rpc('execute_sql', {
      sql: createTableSQL
    });

    if (createError) {
      console.error('Error creating pos_tables:', createError);
    } else {
      console.log('pos_tables table created successfully');
    }

    // Check if the table was created
    console.log('\nVerifying pos_tables creation...');
    const { data: tableCheck, error: tableCheckError } = await supabase.rpc('execute_sql', {
      sql: `SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'pos_tables'
      ) as table_exists;`
    });

    if (tableCheckError) {
      console.error('Error checking table existence:', tableCheckError);
    } else {
      console.log('Table check result:', JSON.stringify(tableCheck, null, 2));
      if (tableCheck && tableCheck.length > 0 && tableCheck[0].table_exists) {
        console.log('✅ pos_tables table exists in the database');
      } else {
        console.log('❌ pos_tables table does not exist in the database');
      }
    }

    // Try to insert a test record
    if (tableCheck && tableCheck.length > 0 && tableCheck[0].table_exists) {
      console.log('\nInserting a test record...');
      const insertSQL = `
        INSERT INTO "pos_tables" ("id", "name", "label", "isActive", "capacity", "positionX", "positionY", "createdAt", "updatedAt", "userId")
        VALUES ('test-table-id', 'Test Table', 'T1', TRUE, 4, 100, 100, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 'test-user-id')
        ON CONFLICT ("id") DO NOTHING
        RETURNING "id", "name";
      `;

      const { data: insertResult, error: insertError } = await supabase.rpc('execute_sql', {
        sql: insertSQL
      });

      if (insertError) {
        console.error('Error inserting test record:', insertError);
      } else {
        console.log('Test record inserted successfully:', insertResult);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    process.exit(1);
  }
}

// Run the creation
createPOSTables();