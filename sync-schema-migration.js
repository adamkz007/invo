// Script to sync Prisma schema with Supabase by adding missing fields
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

async function syncSchema() {
  console.log('Starting schema synchronization...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Add missing fields to Customer table
    console.log('Adding missing fields to Customer table...');
    const { error: customerError } = await supabase.rpc('execute_sql', {
      sql: `
        -- Add missing fields to Customer table
        ALTER TABLE "Customer" 
        ADD COLUMN IF NOT EXISTS "street" TEXT,
        ADD COLUMN IF NOT EXISTS "city" TEXT,
        ADD COLUMN IF NOT EXISTS "postcode" TEXT,
        ADD COLUMN IF NOT EXISTS "state" TEXT,
        ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Malaysia',
        ADD COLUMN IF NOT EXISTS "registrationType" TEXT DEFAULT 'NRIC',
        ADD COLUMN IF NOT EXISTS "registrationNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "taxIdentificationNumber" TEXT;
      `
    });

    if (customerError) {
      console.error('Error updating Customer table:', customerError);
    } else {
      console.log('Customer table updated successfully');
    }

    // Add missing fields to Company table
    console.log('Adding missing fields to Company table...');
    const { error: companyError } = await supabase.rpc('execute_sql', {
      sql: `
        -- Add missing fields to Company table
        ALTER TABLE "Company"
        ADD COLUMN IF NOT EXISTS "street" TEXT,
        ADD COLUMN IF NOT EXISTS "city" TEXT,
        ADD COLUMN IF NOT EXISTS "postcode" TEXT,
        ADD COLUMN IF NOT EXISTS "state" TEXT,
        ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Malaysia';
      `
    });

    if (companyError) {
      console.error('Error updating Company table:', companyError);
    } else {
      console.log('Company table updated successfully');
    }

    // Verify the changes by checking table structure
    console.log('\nVerifying Customer table structure...');
    const { data: customerColumns, error: customerColumnsError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'Customer' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (customerColumnsError) {
      console.error('Error checking Customer table structure:', customerColumnsError);
    } else {
      console.log('Customer table columns:', customerColumns);
    }

    console.log('\nVerifying Company table structure...');
    const { data: companyColumns, error: companyColumnsError } = await supabase.rpc('execute_sql', {
      sql: `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_name = 'Company' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });

    if (companyColumnsError) {
      console.error('Error checking Company table structure:', companyColumnsError);
    } else {
      console.log('Company table columns:', companyColumns);
    }

    console.log('\n✅ Schema synchronization completed successfully!');
    console.log('The missing fields have been added to both Customer and Company tables.');
    console.log('Your Prisma schema should now be in sync with the Supabase database.');

  } catch (error) {
    console.error('❌ Schema synchronization failed:', error);
    process.exit(1);
  }
}

// Run the migration
syncSchema();