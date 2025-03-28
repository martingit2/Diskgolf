-- AlterTable
ALTER TABLE "GameParticipation" ADD COLUMN     "isReady" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'waiting';
