-- CreateEnum
CREATE TYPE "public"."InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PAID', 'PARTIAL', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PosOrderStatus" AS ENUM ('KITCHEN', 'TO_PAY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PosOrderType" AS ENUM ('DINE_IN', 'TAKEAWAY');

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "price" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Invoice" DROP COLUMN "status",
ADD COLUMN     "status" "public"."InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "discountRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "discountAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "paidAmount" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."InvoiceItem" DROP COLUMN "amount",
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."Receipt" ALTER COLUMN "total" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."ReceiptItem" ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."pos_orders" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PosOrderStatus" NOT NULL DEFAULT 'KITCHEN',
DROP COLUMN "orderType",
ADD COLUMN     "orderType" "public"."PosOrderType" NOT NULL DEFAULT 'DINE_IN',
ALTER COLUMN "subtotal" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "taxAmount" SET DATA TYPE DECIMAL(12,2),
ALTER COLUMN "total" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."pos_order_items" DROP COLUMN "amount",
ALTER COLUMN "unitPrice" SET DATA TYPE DECIMAL(12,2);

-- AlterTable
ALTER TABLE "public"."pos_settings" ALTER COLUMN "taxRate" SET DATA TYPE DECIMAL(5,2),
ALTER COLUMN "serviceChargeRate" SET DATA TYPE DECIMAL(5,2);

-- CreateIndex
CREATE INDEX "Customer_userId_createdAt_idx" ON "public"."Customer"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Product_userId_createdAt_idx" ON "public"."Product"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_userId_createdAt_idx" ON "public"."Invoice"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Invoice_userId_status_idx" ON "public"."Invoice"("userId", "status");

-- CreateIndex
CREATE INDEX "Invoice_customerId_idx" ON "public"."Invoice"("customerId");

-- CreateIndex
CREATE INDEX "InvoiceItem_productId_idx" ON "public"."InvoiceItem"("productId");

-- CreateIndex
CREATE INDEX "Receipt_userId_createdAt_idx" ON "public"."Receipt"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "ReceiptItem_productId_idx" ON "public"."ReceiptItem"("productId");

-- CreateIndex
CREATE INDEX "pos_orders_userId_createdAt_idx" ON "public"."pos_orders"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "pos_orders_userId_status_idx" ON "public"."pos_orders"("userId", "status");

-- CreateIndex
CREATE INDEX "pos_order_items_productId_idx" ON "public"."pos_order_items"("productId");

