import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveApiResponse(jobName, jobDescription) {
  console.log("saving api response for " + jobName)
  console.log("jobDescription: " + jobDescription )
  const lowerCaseJobName = jobName.toLowerCase();
  try {
    await prisma.JobDescriptions.upsert({
      where: {
        jobName: lowerCaseJobName
      },
      update: {
        gptModel: process.env.GPT_MODEL,
        jobName,
        jobDescription,
      },
      create: {
        gptModel: process.env.GPT_MODEL,
        jobName,
        jobDescription,
      }
    });
    return true
  } catch (error) {
    console.log("error saving api response to the cache")
    console.log(error.message)
  }

}

export async function getCachedResponse(jobName) {
  const lowerCaseJobName = jobName.toLowerCase();
  return await prisma.JobDescriptions.findFirst({
    where: {
      jobName: lowerCaseJobName
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
