/*
  Warnings:

  - You are about to drop the column `established` on the `Club` table. All the data in the column will be lost.
  - You are about to drop the column `clubId` on the `User` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_clubId_fkey";

-- AlterTable
ALTER TABLE "Club" DROP COLUMN "established",
ADD COLUMN     "email" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "logoUrl" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "clubId";

-- CreateTable
CREATE TABLE "_ClubAdmins" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_ClubAdmins_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_ClubAdmins_B_index" ON "_ClubAdmins"("B");

-- AddForeignKey
ALTER TABLE "_ClubAdmins" ADD CONSTRAINT "_ClubAdmins_A_fkey" FOREIGN KEY ("A") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ClubAdmins" ADD CONSTRAINT "_ClubAdmins_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
