/*
  Warnings:

  - Added the required column `type` to the `CustomProvider` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CustomProvider" ADD COLUMN     "type" TEXT NOT NULL,
ALTER COLUMN "endpoint" DROP NOT NULL;
