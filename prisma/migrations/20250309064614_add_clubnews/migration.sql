-- CreateTable
CREATE TABLE "ClubNews" (
    "id" TEXT NOT NULL,
    "clubId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClubNews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ClubNews_clubId_idx" ON "ClubNews"("clubId");

-- AddForeignKey
ALTER TABLE "ClubNews" ADD CONSTRAINT "ClubNews_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
