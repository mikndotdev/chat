-- AlterTable
ALTER TABLE "CustomProvider" ADD COLUMN     "supportsAttachments" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "name" DROP NOT NULL;
