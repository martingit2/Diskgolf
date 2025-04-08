-- DropForeignKey
ALTER TABLE "Meeting" DROP CONSTRAINT "Meeting_clubId_fkey";

-- AlterTable
ALTER TABLE "Meeting" ADD COLUMN     "cloudinaryPublicId" TEXT;

-- AddForeignKey
ALTER TABLE "Meeting" ADD CONSTRAINT "Meeting_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
