/*
  Warnings:

  - A unique constraint covering the columns `[gameId,holeNumber,userId,playerName]` on the table `GameScore` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `playerName` to the `CompletedGameScore` table without a default value. This is not possible if the table is not empty.
  - Made the column `playerName` on table `GameScore` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "CompletedGameScore" DROP CONSTRAINT "CompletedGameScore_userId_fkey";

-- DropIndex
DROP INDEX "GameScore_gameId_holeNumber_userId_key";

-- AlterTable
ALTER TABLE "CompletedGameScore" ADD COLUMN     "playerName" TEXT NOT NULL,
ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "GameScore" ALTER COLUMN "playerName" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "GameScore_gameId_holeNumber_userId_playerName_key" ON "GameScore"("gameId", "holeNumber", "userId", "playerName");

-- AddForeignKey
ALTER TABLE "CompletedGameScore" ADD CONSTRAINT "CompletedGameScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
