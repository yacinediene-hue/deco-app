-- AlterTable: add referral fields to User
ALTER TABLE "User" ADD COLUMN "referralCode" TEXT;
ALTER TABLE "User" ADD COLUMN "referredBy" TEXT;
ALTER TABLE "User" ADD COLUMN "aiCredits" INTEGER NOT NULL DEFAULT 3;

-- CreateIndex: unique referralCode
CREATE UNIQUE INDEX "User_referralCode_key" ON "User"("referralCode");

-- CreateTable: Referral
CREATE TABLE "Referral" (
    "id"            TEXT NOT NULL,
    "referrerId"    TEXT NOT NULL,
    "refereeId"     TEXT NOT NULL,
    "creditAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Referral_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: unique refereeId (un filleul ne peut être parrainé qu'une fois)
CREATE UNIQUE INDEX "Referral_refereeId_key" ON "Referral"("refereeId");

-- AddForeignKey
ALTER TABLE "Referral" ADD CONSTRAINT "Referral_referrerId_fkey"
    FOREIGN KEY ("referrerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
