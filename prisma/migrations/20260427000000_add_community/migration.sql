-- CommunityPost
CREATE TABLE "CommunityPost" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "beforeUrl" TEXT,
  "style" TEXT NOT NULL,
  "budgetFcfa" INTEGER NOT NULL,
  "budgetLevel" TEXT NOT NULL,
  "caption" TEXT NOT NULL,
  "city" TEXT,
  "country" TEXT,
  "isPublic" BOOLEAN NOT NULL DEFAULT true,
  "reported" BOOLEAN NOT NULL DEFAULT false,
  "likesCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CommunityPost_pkey" PRIMARY KEY ("id")
);

-- PostLike
CREATE TABLE "PostLike" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PostLike_postId_userId_key" ON "PostLike"("postId", "userId");

-- PostComment
CREATE TABLE "PostComment" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostComment_pkey" PRIMARY KEY ("id")
);

-- MonthlyChallenge
CREATE TABLE "MonthlyChallenge" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "theme" TEXT NOT NULL,
  "hashtag" TEXT NOT NULL,
  "budgetFcfa" INTEGER,
  "style" TEXT,
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3) NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MonthlyChallenge_pkey" PRIMARY KEY ("id")
);

-- ChallengeSubmission
CREATE TABLE "ChallengeSubmission" (
  "id" TEXT NOT NULL,
  "challengeId" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "caption" TEXT,
  "votes" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChallengeSubmission_pkey" PRIMARY KEY ("id")
);

-- WhatsAppGroup
CREATE TABLE "WhatsAppGroup" (
  "id" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL,
  "inviteUrl" TEXT NOT NULL,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WhatsAppGroup_pkey" PRIMARY KEY ("id")
);

-- Foreign keys
ALTER TABLE "PostLike" ADD CONSTRAINT "PostLike_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE;
ALTER TABLE "PostComment" ADD CONSTRAINT "PostComment_postId_fkey"
  FOREIGN KEY ("postId") REFERENCES "CommunityPost"("id") ON DELETE CASCADE;
ALTER TABLE "ChallengeSubmission" ADD CONSTRAINT "ChallengeSubmission_challengeId_fkey"
  FOREIGN KEY ("challengeId") REFERENCES "MonthlyChallenge"("id") ON DELETE RESTRICT;
