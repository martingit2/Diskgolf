/*
  Warnings:

  - A unique constraint covering the columns `[tournamentId,playerId]` on the table `TournamentScore` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TournamentScore_tournamentId_playerId_key" ON "TournamentScore"("tournamentId", "playerId");
