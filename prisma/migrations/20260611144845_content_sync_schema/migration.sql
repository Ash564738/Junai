/*
  Warnings:

  - A unique constraint covering the columns `[sourceKey]` on the table `Content` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `sheetName` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sheetRow` to the `Content` table without a default value. This is not possible if the table is not empty.
  - Added the required column `sourceKey` to the `Content` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_contentId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_contentId_fkey";

-- AlterTable
ALTER TABLE "Content" ADD COLUMN     "sheetName" TEXT NOT NULL,
ADD COLUMN     "sheetRow" INTEGER NOT NULL,
ADD COLUMN     "sourceKey" TEXT NOT NULL,
ALTER COLUMN "status" DROP NOT NULL,
ALTER COLUMN "status" DROP DEFAULT,
ALTER COLUMN "status" SET DATA TYPE TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Content_sourceKey_key" ON "Content"("sourceKey");

-- CreateIndex
CREATE INDEX "Content_type_idx" ON "Content"("type");

-- CreateIndex
CREATE INDEX "Content_title_idx" ON "Content"("title");

-- CreateIndex
CREATE INDEX "Content_sheetName_idx" ON "Content"("sheetName");

-- CreateIndex
CREATE INDEX "Message_contentId_idx" ON "Message"("contentId");

-- CreateIndex
CREATE INDEX "Review_contentId_idx" ON "Review"("contentId");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "Content"("id") ON DELETE CASCADE ON UPDATE CASCADE;
