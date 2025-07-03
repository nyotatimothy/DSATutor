-- CreateTable
CREATE TABLE "LearningPath" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "currentLevel" TEXT NOT NULL,
    "targetLevel" TEXT NOT NULL,
    "roadmap" TEXT NOT NULL,
    "immediateNextSteps" TEXT NOT NULL,
    "longTermGoals" TEXT NOT NULL,
    "practiceRecommendations" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LearningPath_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
