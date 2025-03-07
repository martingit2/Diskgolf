/*
  Warnings:

  - Added the required column `latitude` to the `Hole` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longitude` to the `Hole` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "goalLatitude" DOUBLE PRECISION,
ADD COLUMN     "goalLongitude" DOUBLE PRECISION,
ADD COLUMN     "location" TEXT,
ADD COLUMN     "numHoles" INTEGER,
ADD COLUMN     "startLatitude" DOUBLE PRECISION,
ADD COLUMN     "startLongitude" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Hole" ADD COLUMN     "latitude" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "longitude" DOUBLE PRECISION NOT NULL;
