/*
  Warnings:

  - You are about to drop the column `discountCodeId` on the `Promotion` table. All the data in the column will be lost.
  - You are about to drop the `DiscountCode` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductDiscountCodes` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductPromotions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `title` to the `Product` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `Store` required. This step will fail if there are existing NULL values in that column.
  - Made the column `email` on table `Store` required. This step will fail if there are existing NULL values in that column.
  - Made the column `domain` on table `Store` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `Store` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "DiscountCode" DROP CONSTRAINT "DiscountCode_storeId_fkey";

-- DropForeignKey
ALTER TABLE "Promotion" DROP CONSTRAINT "Promotion_discountCodeId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductDiscountCodes" DROP CONSTRAINT "_ProductDiscountCodes_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductDiscountCodes" DROP CONSTRAINT "_ProductDiscountCodes_B_fkey";

-- DropForeignKey
ALTER TABLE "_ProductPromotions" DROP CONSTRAINT "_ProductPromotions_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductPromotions" DROP CONSTRAINT "_ProductPromotions_B_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "title" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Promotion" DROP COLUMN "discountCodeId";

-- AlterTable
ALTER TABLE "Store" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "email" SET NOT NULL,
ALTER COLUMN "domain" SET NOT NULL,
ALTER COLUMN "url" SET NOT NULL;

-- DropTable
DROP TABLE "DiscountCode";

-- DropTable
DROP TABLE "_ProductDiscountCodes";

-- DropTable
DROP TABLE "_ProductPromotions";

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" SERIAL NOT NULL,
    "shopifyId" TEXT NOT NULL,
    "productId" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionProduct" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "variantId" INTEGER,
    "originalPrice" DOUBLE PRECISION NOT NULL,
    "promotionalPrice" DOUBLE PRECISION NOT NULL,
    "hasConflict" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PromotionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromotionDiscountCode" (
    "id" SERIAL NOT NULL,
    "promotionId" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "discountValue" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PromotionDiscountCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProductVariant_shopifyId_key" ON "ProductVariant"("shopifyId");

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionProduct" ADD CONSTRAINT "PromotionProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromotionDiscountCode" ADD CONSTRAINT "PromotionDiscountCode_promotionId_fkey" FOREIGN KEY ("promotionId") REFERENCES "Promotion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
