// Script to migrate schema to Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection URL from environment variables
const supabaseUrl = 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Starting migration to Supabase...');

  try {
    // Check if Receipt table exists
    const { data: receiptsTableCheck, error: receiptsCheckError } = await supabase
      .from('Receipt')
      .select('id')
      .limit(1);

    if (receiptsCheckError && receiptsCheckError.code === '42P01') {
      console.log('Creating Receipt table...');
      
      // Create Receipt table
      const { error: createReceiptError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "Receipt" (
            "id" TEXT NOT NULL,
            "receiptNumber" TEXT NOT NULL,
            "customerName" TEXT NOT NULL,
            "customerPhone" TEXT,
            "receiptDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "paymentMethod" TEXT NOT NULL DEFAULT 'CASH',
            "total" DOUBLE PRECISION NOT NULL,
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "userId" TEXT NOT NULL,
            
            CONSTRAINT "Receipt_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Receipt_receiptNumber_key" UNIQUE ("receiptNumber"),
            CONSTRAINT "Receipt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createReceiptError) {
        console.error('Error creating Receipt table:', createReceiptError);
      } else {
        console.log('Receipt table created successfully');
      }
    } else {
      console.log('Receipt table already exists');
    }

    // Check if ReceiptItem table exists
    const { data: receiptItemsTableCheck, error: receiptItemsCheckError } = await supabase
      .from('ReceiptItem')
      .select('id')
      .limit(1);

    if (receiptItemsCheckError && receiptItemsCheckError.code === '42P01') {
      console.log('Creating ReceiptItem table...');
      
      // Create ReceiptItem table
      const { error: createReceiptItemError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "ReceiptItem" (
            "id" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "unitPrice" DOUBLE PRECISION NOT NULL,
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "receiptId" TEXT NOT NULL,
            "productId" TEXT NOT NULL,
            
            CONSTRAINT "ReceiptItem_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "ReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES "Receipt"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "ReceiptItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createReceiptItemError) {
        console.error('Error creating ReceiptItem table:', createReceiptItemError);
      } else {
        console.log('ReceiptItem table created successfully');
      }
    } else {
      console.log('ReceiptItem table already exists');
    }

    // Add receipts relation to User model
    console.log('Updating User model...');
    const { error: updateUserError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE "User" 
        ALTER COLUMN "name" DROP NOT NULL,
        ALTER COLUMN "email" DROP NOT NULL,
        ALTER COLUMN "phoneNumber" DROP NOT NULL,
        ALTER COLUMN "passwordHash" DROP NOT NULL;
      `
    });

    if (updateUserError) {
      console.error('Error updating User table:', updateUserError);
    } else {
      console.log('User table updated successfully');
    }

    // Update Company model
    console.log('Updating Company model...');
    const { error: updateCompanyError } = await supabase.rpc('execute_sql', {
      sql: `
        ALTER TABLE "Company" 
        ALTER COLUMN "legalName" DROP NOT NULL,
        ALTER COLUMN "ownerName" DROP NOT NULL,
        ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
        ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT,
        ADD COLUMN IF NOT EXISTS "bankName" TEXT,
        ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT,
        ADD COLUMN IF NOT EXISTS "qrImageUrl" TEXT;
      `
    });

    if (updateCompanyError) {
      console.error('Error updating Company table:', updateCompanyError);
    } else {
      console.log('Company table updated successfully');
    }

    // Add receiptItems relation to Product model
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration(); 