/*
  Warnings:

  - You are about to drop the column `customModel` on the `Chat` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "customModel",
ADD COLUMN     "modelType" TEXT NOT NULL DEFAULT 'provider';
