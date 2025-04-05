/*
  Warnings:

  - A unique constraint covering the columns `[stripe_product_id]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_price_id]` on the table `Club` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripe_subscription_id]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Club" ADD COLUMN     "membership_price" INTEGER,
ADD COLUMN     "stripe_price_id" TEXT,
ADD COLUMN     "stripe_product_id" TEXT;

-- AlterTable
ALTER TABLE "Membership" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'inactive',
ADD COLUMN     "stripe_customer_id" TEXT,
ADD COLUMN     "stripe_subscription_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Club_stripe_product_id_key" ON "Club"("stripe_product_id");

-- CreateIndex
CREATE UNIQUE INDEX "Club_stripe_price_id_key" ON "Club"("stripe_price_id");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_stripe_subscription_id_key" ON "Membership"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "Membership_stripe_subscription_id_idx" ON "Membership"("stripe_subscription_id");

-- CreateIndex
CREATE INDEX "Membership_stripe_customer_id_idx" ON "Membership"("stripe_customer_id");
