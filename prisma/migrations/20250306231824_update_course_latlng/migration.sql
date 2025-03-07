/*
  Warnings:

  - You are about to drop the column `location` on the `Course` table. All the data in the column will be lost.
  - Added the required column `latitude` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Course` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" DROP COLUMN "location",
ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
