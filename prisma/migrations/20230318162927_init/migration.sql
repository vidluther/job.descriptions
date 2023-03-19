-- CreateTable
CREATE TABLE "JobDescriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "openaiModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "jobName" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
