-- CreateTable
CREATE TABLE "Like" (
    "slug" TEXT NOT NULL PRIMARY KEY,
    "count" INTEGER NOT NULL DEFAULT 0
);

-- CreateIndex
CREATE UNIQUE INDEX "Like_slug_key" ON "Like"("slug");
