// Script to migrate complete Prisma schema to Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase connection URL from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xvslccdzzowtgroallnm.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'your-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  console.log('Starting complete schema migration to Supabase...');

  try {
    // Create User table if it doesn't exist
    console.log('Checking User table...');
    const { data: userTableCheck, error: userCheckError } = await supabase
      .from('User')
      .select('id')
      .limit(1);

    if (userCheckError && userCheckError.code === '42P01') {
      console.log('Creating User table...');
      
      // Create User table
      const { error: createUserError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "User" (
            "id" TEXT NOT NULL,
            "name" TEXT,
            "email" TEXT,
            "phoneNumber" TEXT,
            "passwordHash" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "stripeCustomerId" TEXT,
            "stripeSubscriptionId" TEXT,
            "stripePriceId" TEXT,
            "subscriptionStatus" TEXT,
            "trialStartDate" TIMESTAMP(3),
            "trialEndDate" TIMESTAMP(3),
            "currentPeriodEnd" TIMESTAMP(3),
            
            CONSTRAINT "User_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "User_email_key" UNIQUE ("email"),
            CONSTRAINT "User_phoneNumber_key" UNIQUE ("phoneNumber")
          );
        `
      });

      if (createUserError) {
        console.error('Error creating User table:', createUserError);
      } else {
        console.log('User table created successfully');
      }
    } else {
      console.log('User table already exists');
    }

    // Create Customer table if it doesn't exist
    console.log('Checking Customer table...');
    const { data: customerTableCheck, error: customerCheckError } = await supabase
      .from('Customer')
      .select('id')
      .limit(1);

    if (customerCheckError && customerCheckError.code === '42P01') {
      console.log('Creating Customer table...');
      
      // Create Customer table
      const { error: createCustomerError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "Customer" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "email" TEXT,
            "phoneNumber" TEXT,
            "street" TEXT,
            "city" TEXT,
            "postcode" TEXT,
            "state" TEXT,
            "country" TEXT DEFAULT 'Malaysia',
            "registrationType" TEXT DEFAULT 'NRIC',
            "registrationNumber" TEXT,
            "taxIdentificationNumber" TEXT,
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "userId" TEXT NOT NULL,
            
            CONSTRAINT "Customer_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createCustomerError) {
        console.error('Error creating Customer table:', createCustomerError);
      } else {
        console.log('Customer table created successfully');
      }
    } else {
      console.log('Customer table already exists');
    }

    // Create Product table if it doesn't exist
    console.log('Checking Product table...');
    const { data: productTableCheck, error: productCheckError } = await supabase
      .from('Product')
      .select('id')
      .limit(1);

    if (productCheckError && productCheckError.code === '42P01') {
      console.log('Creating Product table...');
      
      // Create Product table
      const { error: createProductError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "Product" (
            "id" TEXT NOT NULL,
            "name" TEXT NOT NULL,
            "description" TEXT,
            "price" DOUBLE PRECISION NOT NULL,
            "quantity" INTEGER NOT NULL DEFAULT 0,
            "sku" TEXT,
            "disableStockManagement" BOOLEAN NOT NULL DEFAULT false,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "userId" TEXT NOT NULL,
            
            CONSTRAINT "Product_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Product_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createProductError) {
        console.error('Error creating Product table:', createProductError);
      } else {
        console.log('Product table created successfully');
      }
    } else {
      console.log('Product table already exists');
    }

    // Create Invoice table if it doesn't exist
    console.log('Checking Invoice table...');
    const { data: invoiceTableCheck, error: invoiceCheckError } = await supabase
      .from('Invoice')
      .select('id')
      .limit(1);

    if (invoiceCheckError && invoiceCheckError.code === '42P01') {
      console.log('Creating Invoice table...');
      
      // Create Invoice table
      const { error: createInvoiceError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "Invoice" (
            "id" TEXT NOT NULL,
            "invoiceNumber" TEXT NOT NULL,
            "issueDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "dueDate" TIMESTAMP(3) NOT NULL,
            "status" TEXT NOT NULL DEFAULT 'DRAFT',
            "subtotal" DOUBLE PRECISION NOT NULL,
            "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "discountRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "total" DOUBLE PRECISION NOT NULL,
            "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
            "notes" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "customerId" TEXT NOT NULL,
            "userId" TEXT NOT NULL,
            
            CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Invoice_invoiceNumber_key" UNIQUE ("invoiceNumber"),
            CONSTRAINT "Invoice_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "Invoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createInvoiceError) {
        console.error('Error creating Invoice table:', createInvoiceError);
      } else {
        console.log('Invoice table created successfully');
      }
    } else {
      console.log('Invoice table already exists');
    }

    // Create InvoiceItem table if it doesn't exist
    console.log('Checking InvoiceItem table...');
    const { data: invoiceItemTableCheck, error: invoiceItemCheckError } = await supabase
      .from('InvoiceItem')
      .select('id')
      .limit(1);

    if (invoiceItemCheckError && invoiceItemCheckError.code === '42P01') {
      console.log('Creating InvoiceItem table...');
      
      // Create InvoiceItem table
      const { error: createInvoiceItemError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "InvoiceItem" (
            "id" TEXT NOT NULL,
            "quantity" INTEGER NOT NULL,
            "unitPrice" DOUBLE PRECISION NOT NULL,
            "amount" DOUBLE PRECISION NOT NULL,
            "description" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "invoiceId" TEXT NOT NULL,
            "productId" TEXT NOT NULL,
            
            CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "InvoiceItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createInvoiceItemError) {
        console.error('Error creating InvoiceItem table:', createInvoiceItemError);
      } else {
        console.log('InvoiceItem table created successfully');
      }
    } else {
      console.log('InvoiceItem table already exists');
    }

    // Create Company table if it doesn't exist
    console.log('Checking Company table...');
    const { data: companyTableCheck, error: companyCheckError } = await supabase
      .from('Company')
      .select('id')
      .limit(1);

    if (companyCheckError && companyCheckError.code === '42P01') {
      console.log('Creating Company table...');
      
      // Create Company table
      const { error: createCompanyError } = await supabase.rpc('execute_sql', {
        sql: `
          CREATE TABLE "Company" (
            "id" TEXT NOT NULL,
            "legalName" TEXT,
            "ownerName" TEXT,
            "address" TEXT,
            "street" TEXT,
            "city" TEXT,
            "postcode" TEXT,
            "state" TEXT,
            "country" TEXT DEFAULT 'Malaysia',
            "phoneNumber" TEXT,
            "email" TEXT,
            "registrationNumber" TEXT,
            "taxIdentificationNumber" TEXT,
            "termsAndConditions" TEXT,
            "paymentMethod" TEXT,
            "bankAccountName" TEXT,
            "bankName" TEXT,
            "bankAccountNumber" TEXT,
            "qrImageUrl" TEXT,
            "msicCode" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL,
            "userId" TEXT NOT NULL,
            
            CONSTRAINT "Company_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "Company_userId_key" UNIQUE ("userId"),
            CONSTRAINT "Company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
          );
        `
      });

      if (createCompanyError) {
        console.error('Error creating Company table:', createCompanyError);
      } else {
        console.log('Company table created successfully');
      }
    } else {
      console.log('Company table already exists');
    }

    // Check if Receipt table exists
    console.log('Checking Receipt table...');
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
    console.log('Checking ReceiptItem table...');
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

    // Update User model to make fields nullable
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

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

runMigration();