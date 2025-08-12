// Script to create all POS tables directly using Supabase client
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

async function createAllPOSTables() {
  console.log('Creating all POS tables directly...');

  try {
    // Create pos_orders table
    console.log('\nCreating pos_orders table...');
    const { data: ordersData, error: ordersError } = await supabase
      .from('pos_orders')
      .select('*')
      .limit(1);
    
    if (ordersError && ordersError.code === '42P01') {
      console.log('pos_orders table does not exist, creating it...');
      
      // Insert a test record to create the table
      const { data: insertOrderData, error: insertOrderError } = await supabase
        .from('pos_orders')
        .insert([
          {
            id: 'test-order-id',
            orderNumber: 'ORD-001',
            tableNumber: 'T1',
            tableId: 'test-table-id',
            status: 'KITCHEN',
            orderType: 'DINE_IN',
            subtotal: 0,
            taxRate: 0,
            taxAmount: 0,
            total: 0,
            notes: 'Test order',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'cm8e069wy0000l403ajvpmh20'
          }
        ]);
      
      if (insertOrderError) {
        console.error('Error creating pos_orders table:', insertOrderError);
      } else {
        console.log('pos_orders table created successfully');
      }
    } else if (ordersError) {
      console.error('Error checking pos_orders table:', ordersError);
    } else {
      console.log('pos_orders table already exists');
    }

    // Create pos_order_items table
    console.log('\nCreating pos_order_items table...');
    const { data: orderItemsData, error: orderItemsError } = await supabase
      .from('pos_order_items')
      .select('*')
      .limit(1);
    
    if (orderItemsError && orderItemsError.code === '42P01') {
      console.log('pos_order_items table does not exist, creating it...');
      
      // First, check if we have any products to reference
      const { data: productsData, error: productsError } = await supabase
        .from('Product')
        .select('id')
        .limit(1);
      
      if (productsError) {
        console.error('Error checking products:', productsError);
      } else if (productsData && productsData.length > 0) {
        // Insert a test record to create the table
        const { data: insertItemData, error: insertItemError } = await supabase
          .from('pos_order_items')
          .insert([
            {
              id: 'test-order-item-id',
              quantity: 1,
              unitPrice: 10,
              amount: 10,
              notes: 'Test item',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              orderId: 'test-order-id',
              productId: productsData[0].id
            }
          ]);
        
        if (insertItemError) {
          console.error('Error creating pos_order_items table:', insertItemError);
        } else {
          console.log('pos_order_items table created successfully');
        }
      } else {
        console.log('No products found to create test order item');
      }
    } else if (orderItemsError) {
      console.error('Error checking pos_order_items table:', orderItemsError);
    } else {
      console.log('pos_order_items table already exists');
    }

    // Create pos_settings table
    console.log('\nCreating pos_settings table...');
    const { data: settingsData, error: settingsError } = await supabase
      .from('pos_settings')
      .select('*')
      .limit(1);
    
    if (settingsError && settingsError.code === '42P01') {
      console.log('pos_settings table does not exist, creating it...');
      
      // Insert a test record to create the table
      const { data: insertSettingsData, error: insertSettingsError } = await supabase
        .from('pos_settings')
        .insert([
          {
            id: 'test-settings-id',
            autoPrintEnabled: false,
            defaultPrinterAddress: '',
            tableLayoutType: 'LIST',
            taxRate: 0,
            serviceChargeRate: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            userId: 'cm8e069wy0000l403ajvpmh20'
          }
        ]);
      
      if (insertSettingsError) {
        console.error('Error creating pos_settings table:', insertSettingsError);
      } else {
        console.log('pos_settings table created successfully');
      }
    } else if (settingsError) {
      console.error('Error checking pos_settings table:', settingsError);
    } else {
      console.log('pos_settings table already exists');
    }

    // Verify all tables
    console.log('\nVerifying all POS tables...');
    const tables = ['pos_tables', 'pos_orders', 'pos_order_items', 'pos_settings'];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      if (error) {
        console.error(`Error verifying ${table}:`, error);
      } else {
        console.log(`✅ ${table} exists and is accessible`);
      }
    }

  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Run the creation
createAllPOSTables();