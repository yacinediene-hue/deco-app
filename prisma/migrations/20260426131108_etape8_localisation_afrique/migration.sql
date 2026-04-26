-- AlterTable
ALTER TABLE "AccessoryCatalog" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "isHandmade" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "localMaterial" TEXT,
ADD COLUMN     "tropicalFriendly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vendorContactWhatsapp" TEXT,
ADD COLUMN     "vendorName" TEXT,
ADD COLUMN     "vendorType" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT;
