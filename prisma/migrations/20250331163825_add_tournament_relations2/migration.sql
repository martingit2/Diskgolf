-- CreateTable
CREATE TABLE "TournamentGameSession" (
    "id" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "roundNumber" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'waiting',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TournamentGameSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentGameParticipation" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "isReady" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TournamentGameParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TournamentGameScore" (
    "id" TEXT NOT NULL,
    "gameSessionId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "holeNumber" INTEGER NOT NULL,
    "strokes" INTEGER NOT NULL,
    "obCount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TournamentGameScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TournamentGameSession_tournamentId_roundNumber_key" ON "TournamentGameSession"("tournamentId", "roundNumber");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentGameParticipation_gameSessionId_playerId_key" ON "TournamentGameParticipation"("gameSessionId", "playerId");

-- CreateIndex
CREATE UNIQUE INDEX "TournamentGameScore_gameSessionId_playerId_holeNumber_key" ON "TournamentGameScore"("gameSessionId", "playerId", "holeNumber");

-- AddForeignKey
ALTER TABLE "TournamentGameSession" ADD CONSTRAINT "TournamentGameSession_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGameParticipation" ADD CONSTRAINT "TournamentGameParticipation_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "TournamentGameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGameParticipation" ADD CONSTRAINT "TournamentGameParticipation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGameScore" ADD CONSTRAINT "TournamentGameScore_gameSessionId_fkey" FOREIGN KEY ("gameSessionId") REFERENCES "TournamentGameSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGameScore" ADD CONSTRAINT "TournamentGameScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
