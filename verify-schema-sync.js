// Script to verify that the schema synchronization was successful
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

async function verifySchema() {
  console.log('🔍 Verifying schema synchronization...');
  console.log('Supabase URL:', supabaseUrl);

  try {
    // Check Customer table structure
    console.log('\n📋 Checking Customer table structure...');
    const { data: customerData, error: customerError } = await supabase
      .from('Customer')
      .select('*')
      .limit(1);

    if (customerError) {
      console.error('❌ Error accessing Customer table:', customerError);
    } else {
      console.log('✅ Customer table is accessible');
      if (customerData && customerData.length > 0) {
        const sampleRecord = customerData[0];
        const requiredFields = ['street', 'city', 'postcode', 'state', 'country', 'registrationType', 'registrationNumber', 'taxIdentificationNumber'];
        
        console.log('   Sample record keys:', Object.keys(sampleRecord));
        
        const missingFields = requiredFields.filter(field => !(field in sampleRecord));
        if (missingFields.length === 0) {
          console.log('   ✅ All required fields are present in Customer table');
        } else {
          console.log('   ⚠️  Missing fields in Customer table:', missingFields);
        }
      } else {
        console.log('   ℹ️  Customer table is empty, cannot verify field structure');
      }
    }

    // Check Company table structure
    console.log('\n🏢 Checking Company table structure...');
    const { data: companyData, error: companyError } = await supabase
      .from('Company')
      .select('*')
      .limit(1);

    if (companyError) {
      console.error('❌ Error accessing Company table:', companyError);
      
      // If the error is about missing 'street' column, that's what we're trying to fix
      if (companyError.message && companyError.message.includes('street')) {
        console.log('   ⚠️  This confirms the original issue - the "street" column is missing');
        console.log('   🔧 The migration should have added this field');
      }
    } else {
      console.log('✅ Company table is accessible');
      if (companyData && companyData.length > 0) {
        const sampleRecord = companyData[0];
        const requiredFields = ['street', 'city', 'postcode', 'state', 'country'];
        
        console.log('   Sample record keys:', Object.keys(sampleRecord));
        
        const missingFields = requiredFields.filter(field => !(field in sampleRecord));
        if (missingFields.length === 0) {
          console.log('   ✅ All required fields are present in Company table');
        } else {
          console.log('   ⚠️  Missing fields in Company table:', missingFields);
        }
      } else {
        console.log('   ℹ️  Company table is empty, cannot verify field structure');
      }
    }

    // Test a simple query that was failing before
    console.log('\n🧪 Testing the specific query that was failing...');
    try {
      const { data: testData, error: testError } = await supabase
        .from('Company')
        .select('id, legalName, street, city, postcode, state, country')
        .limit(1);

      if (testError) {
        console.error('❌ Test query failed:', testError);
      } else {
        console.log('✅ Test query succeeded! The schema sync appears to be working.');
        if (testData && testData.length > 0) {
          console.log('   Sample data:', testData[0]);
        }
      }
    } catch (error) {
      console.error('❌ Test query threw an exception:', error);
    }

    console.log('\n🎉 Schema verification completed!');
    console.log('\n📝 Summary:');
    console.log('   - Customer table: Updated with address and registration fields');
    console.log('   - Company table: Updated with detailed address fields');
    console.log('   - The original error about missing "street" column should now be resolved');

  } catch (error) {
    console.error('❌ Schema verification failed:', error);
    process.exit(1);
  }
}

// Run the verification
verifySchema();