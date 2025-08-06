-- AlterTable
ALTER TABLE "Company" ADD COLUMN "city" TEXT;
ALTER TABLE "Company" ADD COLUMN "country" TEXT DEFAULT 'Malaysia';
ALTER TABLE "Company" ADD COLUMN "postcode" TEXT;
ALTER TABLE "Company" ADD COLUMN "state" TEXT;
ALTER TABLE "Company" ADD COLUMN "street" TEXT;
