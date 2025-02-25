/*
  Warnings:

  - Added the required column `storeId` to the `DiscountCode` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "Store" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "domain" TEXT,
    "url" TEXT,

    CONSTRAINT "Store_pkey" PRIMARY KEY ("id")
);

-- Insert a default store.
INSERT INTO "Store" ("shopifyId", "name", "email", "domain", "url")
VALUES ('default-store', 'Default Store', '', '', '');

-- CreateIndex
CREATE UNIQUE INDEX "Store_shopifyId_key" ON "Store"("shopifyId");

-- Alter DiscountCode table: add storeId column with a default value (id of default store, assumed to be 1).
ALTER TABLE "DiscountCode"
ADD COLUMN "storeId" INTEGER DEFAULT 1 NOT NULL;

-- AddForeignKey
ALTER TABLE "DiscountCode" ADD CONSTRAINT "DiscountCode_storeId_fkey" FOREIGN KEY ("storeId") REFERENCES "Store"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
