-- Add optional image URL for products to support POS product cards
ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;



