-- Migration to add POS tables to Supabase

-- Create PosOrder table
CREATE TABLE IF NOT EXISTS "pos_orders" (
  "id" TEXT NOT NULL,
  "orderNumber" TEXT NOT NULL,
  "tableNumber" TEXT NOT NULL,
  "tableId" TEXT,
  "status" TEXT NOT NULL DEFAULT 'KITCHEN',
  "orderType" TEXT NOT NULL DEFAULT 'DINE_IN',
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "taxAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  
  CONSTRAINT "pos_orders_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pos_orders_orderNumber_key" UNIQUE ("orderNumber"),
  CONSTRAINT "pos_orders_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create PosOrderItem table
CREATE TABLE IF NOT EXISTS "pos_order_items" (
  "id" TEXT NOT NULL,
  "quantity" INTEGER NOT NULL,
  "unitPrice" DOUBLE PRECISION NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  
  CONSTRAINT "pos_order_items_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pos_order_items_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "pos_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT "pos_order_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create PosTable table
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

-- Create PosSettings table
CREATE TABLE IF NOT EXISTS "pos_settings" (
  "id" TEXT NOT NULL,
  "autoPrintEnabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "defaultPrinterAddress" TEXT,
  "tableLayoutType" TEXT NOT NULL DEFAULT 'LIST',
  "taxRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "serviceChargeRate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "userId" TEXT NOT NULL,
  
  CONSTRAINT "pos_settings_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "pos_settings_userId_key" UNIQUE ("userId"),
  CONSTRAINT "pos_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Add foreign key from PosOrder to PosTable
ALTER TABLE "pos_orders"
ADD CONSTRAINT "pos_orders_tableId_fkey" FOREIGN KEY ("tableId") REFERENCES "pos_tables"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create triggers for updatedAt columns
CREATE TRIGGER update_pos_orders_updated_at
BEFORE UPDATE ON "pos_orders"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pos_order_items_updated_at
BEFORE UPDATE ON "pos_order_items"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pos_tables_updated_at
BEFORE UPDATE ON "pos_tables"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_pos_settings_updated_at
BEFORE UPDATE ON "pos_settings"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();