-- Optimize invoice item lookups by invoice and product
CREATE INDEX IF NOT EXISTS "InvoiceItem_invoiceId_productId_idx" ON "InvoiceItem" ("invoiceId", "productId");

