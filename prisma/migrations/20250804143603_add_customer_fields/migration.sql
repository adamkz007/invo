-- AlterTable
ALTER TABLE "Customer" ADD COLUMN "city" TEXT;
ALTER TABLE "Customer" ADD COLUMN "country" TEXT DEFAULT 'Malaysia';
ALTER TABLE "Customer" ADD COLUMN "postcode" TEXT;
ALTER TABLE "Customer" ADD COLUMN "registrationNumber" TEXT;
ALTER TABLE "Customer" ADD COLUMN "registrationType" TEXT DEFAULT 'NRIC';
ALTER TABLE "Customer" ADD COLUMN "state" TEXT;
ALTER TABLE "Customer" ADD COLUMN "street" TEXT;
ALTER TABLE "Customer" ADD COLUMN "taxIdentificationNumber" TEXT;
