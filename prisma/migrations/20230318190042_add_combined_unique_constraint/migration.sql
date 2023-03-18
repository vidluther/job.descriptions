/*
  Warnings:

  - A unique constraint covering the columns `[gptModel,jobName]` on the table `JobDescriptions` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "JobDescriptions_gptModel_jobName_key" ON "JobDescriptions"("gptModel", "jobName");
