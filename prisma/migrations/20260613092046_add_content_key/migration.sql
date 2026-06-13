/*
  Warnings:

  - A unique constraint covering the columns `[contentKey]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `contentKey` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Content_sourceKey_key";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "contentKey" TEXT NOT NULL,
ALTER COLUMN "sourceKey" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Content_contentKey_key" ON "Content"("contentKey");

-- CreateIndex
CREATE INDEX "Content_sourceKey_idx" ON "Content"("sourceKey");
