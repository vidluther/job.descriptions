/*
  Warnings:

  - You are about to drop the column `openaiModel` on the `JobDescriptions` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_JobDescriptions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "gptModel" TEXT NOT NULL DEFAULT 'gpt-4',
    "jobName" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_JobDescriptions" ("createdAt", "id", "jobDescription", "jobName", "updatedAt") SELECT "createdAt", "id", "jobDescription", "jobName", "updatedAt" FROM "JobDescriptions";
DROP TABLE "JobDescriptions";
ALTER TABLE "new_JobDescriptions" RENAME TO "JobDescriptions";
CREATE UNIQUE INDEX "JobDescriptions_jobName_key" ON "JobDescriptions"("jobName");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
