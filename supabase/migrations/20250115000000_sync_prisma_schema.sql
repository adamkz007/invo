-- Migration to sync Supabase schema with Prisma schema
-- This adds missing fields that exist in Prisma but not in Supabase

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

-- Add missing fields to Company table
ALTER TABLE "Company"
ADD COLUMN IF NOT EXISTS "street" TEXT,
ADD COLUMN IF NOT EXISTS "city" TEXT,
ADD COLUMN IF NOT EXISTS "postcode" TEXT,
ADD COLUMN IF NOT EXISTS "state" TEXT,
ADD COLUMN IF NOT EXISTS "country" TEXT DEFAULT 'Malaysia';

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure triggers exist for all tables with updatedAt columns
DROP TRIGGER IF EXISTS update_customer_updated_at ON "Customer";
CREATE TRIGGER update_customer_updated_at
BEFORE UPDATE ON "Customer"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_product_updated_at ON "Product";
CREATE TRIGGER update_product_updated_at
BEFORE UPDATE ON "Product"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_updated_at ON "Invoice";
CREATE TRIGGER update_invoice_updated_at
BEFORE UPDATE ON "Invoice"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_invoice_item_updated_at ON "InvoiceItem";
CREATE TRIGGER update_invoice_item_updated_at
BEFORE UPDATE ON "InvoiceItem"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_company_updated_at ON "Company";
CREATE TRIGGER update_company_updated_at
BEFORE UPDATE ON "Company"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_receipt_updated_at ON "Receipt";
CREATE TRIGGER update_receipt_updated_at
BEFORE UPDATE ON "Receipt"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_receipt_item_updated_at ON "ReceiptItem";
CREATE TRIGGER update_receipt_item_updated_at
BEFORE UPDATE ON "ReceiptItem"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Add comment to track this migration
COMMENT ON TABLE "Customer" IS 'Updated to match Prisma schema - added address fields and registration info';
COMMENT ON TABLE "Company" IS 'Updated to match Prisma schema - added detailed address fields';