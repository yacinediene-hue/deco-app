-- CreateTable
CREATE TABLE "Simulation" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "furnitureType" TEXT NOT NULL,
    "dominantColor" TEXT NOT NULL,
    "style" TEXT NOT NULL,
    "budgetFcfa" INTEGER NOT NULL,
    "budgetLevel" TEXT NOT NULL,
    "accessories" JSONB NOT NULL,
    "totalFcfa" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Simulation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Simulation" ADD CONSTRAINT "Simulation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
