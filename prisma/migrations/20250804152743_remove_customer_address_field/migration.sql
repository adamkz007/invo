/*
  Warnings:

  - You are about to drop the column `address` on the `Customer` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Customer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Customer" ("city", "country", "createdAt", "email", "id", "name", "notes", "phoneNumber", "postcode", "registrationNumber", "registrationType", "state", "street", "taxIdentificationNumber", "updatedAt", "userId") SELECT "city", "country", "createdAt", "email", "id", "name", "notes", "phoneNumber", "postcode", "registrationNumber", "registrationType", "state", "street", "taxIdentificationNumber", "updatedAt", "userId" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
