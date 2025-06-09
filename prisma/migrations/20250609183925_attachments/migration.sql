/*
  Warnings:

  - You are about to drop the column `messageId` on the `Attachment` table. All the data in the column will be lost.
  - You are about to drop the column `chatId` on the `File` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `File` table. All the data in the column will be lost.
  - Added the required column `chatId` to the `Attachment` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Attachment" DROP CONSTRAINT "Attachment_messageId_fkey";

-- AlterTable
ALTER TABLE "Attachment" DROP COLUMN "messageId",
ADD COLUMN     "chatId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "File" DROP COLUMN "chatId",
DROP COLUMN "type";

-- AddForeignKey
ALTER TABLE "Attachment" ADD CONSTRAINT "Attachment_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
