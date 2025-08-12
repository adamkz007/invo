// Script to create POS tables directly using Supabase client
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

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false
  }
});

async function createPOSTables() {
  console.log('Creating POS tables directly...');

  try {
    // Check if pos_tables exists
    console.log('\nChecking if pos_tables exists...');
    const { data: existingData, error: existingError } = await supabase
      .from('pos_tables')
      .select('*')
      .limit(1);
    
    if (existingError && existingError.code !== '42P01') { // 42P01 is the error code for table not found
      console.error('Error checking if pos_tables exists:', existingError);
    } else if (!existingError) {
      console.log('pos_tables already exists:', existingData);
    } else {
      console.log('pos_tables does not exist, we need to create it');
    }

    // Create pos_tables using raw SQL
    console.log('\nCreating pos_tables using raw SQL...');
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
        
        CONSTRAINT "pos_tables_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "pos_tables_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `;

    // Since we can't execute raw SQL directly, let's try to create a test record
    // and see if the table gets auto-created
    console.log('\nTrying to insert a test record to create the table...');
    const { data: insertData, error: insertError } = await supabase
      .from('pos_tables')
      .insert([
        {
          id: 'test-table-id',
          name: 'Test Table',
          label: 'T1',
          isActive: true,
          capacity: 4,
          positionX: 100,
          positionY: 100,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: 'cm8e069wy0000l403ajvpmh20' // Using a user ID from the previous script
        }
      ]);
    
    if (insertError) {
      console.error('Error inserting test record:', insertError);
    } else {
      console.log('Test record inserted successfully:', insertData);
    }

    // Check if pos_tables exists now
    console.log('\nChecking if pos_tables exists after insert attempt...');
    const { data: checkData, error: checkError } = await supabase
      .from('pos_tables')
      .select('*')
      .limit(5);
    
    if (checkError) {
      console.error('Error checking pos_tables:', checkError);
    } else {
      console.log('pos_tables data:', checkData);
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the creation
createPOSTables();