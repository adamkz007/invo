-- Migration SQL script to run in Supabase SQL Editor

-- 1. Create Receipt table
CREATE TABLE IF NOT EXISTS "Receipt" (
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

-- 2. Create ReceiptItem table
CREATE TABLE IF NOT EXISTS "ReceiptItem" (
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

-- 3. Update User model to make fields nullable
ALTER TABLE "User" 
ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phoneNumber" DROP NOT NULL,
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- 4. Update Company model to add new fields
ALTER TABLE "Company" 
ALTER COLUMN "legalName" DROP NOT NULL,
ALTER COLUMN "ownerName" DROP NOT NULL;

-- 5. Add new columns to Company table
ALTER TABLE "Company" 
ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT,
ADD COLUMN IF NOT EXISTS "bankAccountName" TEXT,
ADD COLUMN IF NOT EXISTS "bankName" TEXT,
ADD COLUMN IF NOT EXISTS "bankAccountNumber" TEXT,
ADD COLUMN IF NOT EXISTS "qrImageUrl" TEXT;

-- 6. Add receipts relation to User model (this is handled by foreign key constraint) 