/*
  Warnings:

  - You are about to drop the column `dateTime` on the `Tournament` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `Tournament` table. All the data in the column will be lost.
  - Added the required column `courseId` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizerId` to the `Tournament` table without a default value. This is not possible if the table is not empty.
  - Added the required column `startDate` to the `Tournament` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TournamentStatus" AS ENUM ('PLANNING', 'REGISTRATION_OPEN', 'IN_PROGRESS', 'COMPLETED');

-- AlterTable
ALTER TABLE "Tournament" DROP COLUMN "dateTime",
DROP COLUMN "type",
ADD COLUMN     "courseId" TEXT NOT NULL,
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "organizerId" TEXT NOT NULL,
ADD COLUMN     "startDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "status" "TournamentStatus" NOT NULL DEFAULT 'PLANNING',
ALTER COLUMN "maxParticipants" DROP NOT NULL;

-- DropEnum
DROP TYPE "TournamentType";

-- CreateTable
CREATE TABLE "TournamentScore" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "totalScore" INTEGER NOT NULL,
    "totalOb" INTEGER NOT NULL,
    "strokes" JSONB NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TournamentScore_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentScore" ADD CONSTRAINT "TournamentScore_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentScore" ADD CONSTRAINT "TournamentScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
