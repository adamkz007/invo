-- Add Stripe customer fields to the User table
ALTER TABLE "User"
ADD COLUMN IF NOT EXISTS "stripeCustomerId" TEXT,
ADD COLUMN IF NOT EXISTS "stripeSubscriptionId" TEXT,
ADD COLUMN IF NOT EXISTS "stripePriceId" TEXT,
ADD COLUMN IF NOT EXISTS "subscriptionStatus" TEXT,
ADD COLUMN IF NOT EXISTS "trialStartDate" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "trialEndDate" TIMESTAMP,
ADD COLUMN IF NOT EXISTS "currentPeriodEnd" TIMESTAMP;

-- Make sure updated_at is updated when rows are modified
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW."updatedAt" = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Ensure the trigger exists for the User table
DROP TRIGGER IF EXISTS update_user_updated_at ON "User";
CREATE TRIGGER update_user_updated_at
BEFORE UPDATE ON "User"
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column(); 