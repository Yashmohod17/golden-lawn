/*
  Warnings:

  - Added the required column `password` to the `Customer` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Customer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "avatar" TEXT NOT NULL DEFAULT 'RK',
    "joinedDate" TEXT NOT NULL,
    "cateringPref" TEXT,
    "themePref" TEXT,
    "contactPref" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CUSTOMER',
    "refreshToken" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Customer" ("address", "avatar", "cateringPref", "contactPref", "createdAt", "email", "id", "joinedDate", "name", "phone", "themePref") SELECT "address", "avatar", "cateringPref", "contactPref", "createdAt", "email", "id", "joinedDate", "name", "phone", "themePref" FROM "Customer";
DROP TABLE "Customer";
ALTER TABLE "new_Customer" RENAME TO "Customer";
CREATE UNIQUE INDEX "Customer_email_key" ON "Customer"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
