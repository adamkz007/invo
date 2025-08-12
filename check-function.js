// Script to check if update_updated_at_column function exists in Supabase
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

async function checkFunction() {
  try {
    console.log('Checking if update_updated_at_column function exists...');
    const { data, error } = await supabase.rpc('execute_sql', {
      sql: "SELECT proname, prosrc FROM pg_proc WHERE proname = 'update_updated_at_column';"
    });

    if (error) {
      console.error('Error checking function:', error);
    } else {
      console.log('Function exists:', data && data.length > 0);
      if (data && data.length > 0) {
        console.log('Function source:', data[0].prosrc);
      } else {
        console.log('Function does not exist. Creating it...');
        
        // Create the function if it doesn't exist
        const createFunctionSQL = `
          CREATE OR REPLACE FUNCTION update_updated_at_column()
          RETURNS TRIGGER AS $$
          BEGIN
            NEW."updatedAt" = CURRENT_TIMESTAMP;
            RETURN NEW;
          END;
          $$ LANGUAGE plpgsql;
        `;
        
        const { error: createError } = await supabase.rpc('execute_sql', {
          sql: createFunctionSQL
        });
        
        if (createError) {
          console.error('Error creating function:', createError);
        } else {
          console.log('Function created successfully!');
        }
      }
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the check
checkFunction();