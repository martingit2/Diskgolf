-- AlterTable
ALTER TABLE "NewsArticle" ADD COLUMN     "excerpt" TEXT;

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CategoryToNewsArticle" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CategoryToNewsArticle_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "_CategoryToNewsArticle_B_index" ON "_CategoryToNewsArticle"("B");

-- CreateIndex
CREATE INDEX "NewsArticle_title_idx" ON "NewsArticle"("title");

-- AddForeignKey
ALTER TABLE "_CategoryToNewsArticle" ADD CONSTRAINT "_CategoryToNewsArticle_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CategoryToNewsArticle" ADD CONSTRAINT "_CategoryToNewsArticle_B_fkey" FOREIGN KEY ("B") REFERENCES "NewsArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
