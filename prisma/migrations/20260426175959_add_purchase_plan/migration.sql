-- CreateTable
CREATE TABLE "PurchasePlan" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthlyBudgetFcfa" INTEGER NOT NULL,
    "months" JSONB NOT NULL,
    "totalFcfa" INTEGER NOT NULL,
    "durationMonths" INTEGER NOT NULL,
    "reminderEnabled" BOOLEAN NOT NULL DEFAULT false,
    "startMonth" INTEGER NOT NULL,
    "startYear" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PurchasePlan_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PurchasePlan" ADD CONSTRAINT "PurchasePlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
