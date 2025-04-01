-- DropForeignKey
ALTER TABLE "CompletedGameScore" DROP CONSTRAINT "CompletedGameScore_userId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentGameParticipation" DROP CONSTRAINT "TournamentGameParticipation_playerId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentGameScore" DROP CONSTRAINT "TournamentGameScore_playerId_fkey";

-- DropForeignKey
ALTER TABLE "TournamentScore" DROP CONSTRAINT "TournamentScore_playerId_fkey";

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompletedGameScore" ADD CONSTRAINT "CompletedGameScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentScore" ADD CONSTRAINT "TournamentScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGameParticipation" ADD CONSTRAINT "TournamentGameParticipation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TournamentGameScore" ADD CONSTRAINT "TournamentGameScore_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
