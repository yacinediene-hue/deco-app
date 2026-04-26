-- CreateTable
CREATE TABLE "ShareablePost" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "squareImageUrl" TEXT NOT NULL,
    "carouselUrls" TEXT[],
    "videoUrl" TEXT,
    "style" TEXT NOT NULL,
    "budgetFcfa" INTEGER NOT NULL,
    "budgetLevel" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "shareCount" INTEGER NOT NULL DEFAULT 0,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareablePost_pkey" PRIMARY KEY ("id")
);
