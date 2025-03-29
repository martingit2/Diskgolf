/*
  Warnings:

  - A unique constraint covering the columns `[gameId,holeNumber,userId]` on the table `GameScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "GameScore_gameId_holeNumber_userId_key" ON "GameScore"("gameId", "holeNumber", "userId");
