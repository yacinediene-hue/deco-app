-- AlterTable
ALTER TABLE "AccessoryCatalog" ADD COLUMN     "externalUrl" TEXT,
ADD COLUMN     "inStock" BOOLEAN NOT NULL DEFAULT true;
