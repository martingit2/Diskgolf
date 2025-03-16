/*
  Warnings:

  - Added the required column `dateTime` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `location` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxParticipants` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Tournament" ADD COLUMN     "dateTime" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "image" TEXT,
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "maxParticipants" INTEGER NOT NULL;
