-- CreateTable
CREATE TABLE "EditablePageContent" (
    "id" TEXT NOT NULL,
    "pageKey" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "useCustom" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditablePageContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EditablePageContent_pageKey_key" ON "EditablePageContent"("pageKey");

-- CreateIndex
CREATE INDEX "EditablePageContent_pageKey_idx" ON "EditablePageContent"("pageKey");
