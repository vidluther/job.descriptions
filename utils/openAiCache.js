import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function saveApiResponse(jobName, jobDescription) {
  console.log("saving api response for " + jobName)
  console.log("jobDescription: " + jobDescription )
  const lowerCaseJobName = jobName.toLowerCase();

  const existingRecord = await prisma.jobDescriptions.findFirst({
    where: {
      gptModel: process.env.NEXT_PUBLIC_GPT_MODEL,
      jobName: lowerCaseJobName
    }
  });
  if (existingRecord) {
    console.log("Found existing record for " + jobName + " and " + process.env.NEXT_PUBLIC_GPT_MODEL )
    await prisma.jobDescriptions.update({
      where: {
        id: existingRecord.id,
      },
      data: {
        jobName: lowerCaseJobName.trim(),
        jobDescription: jobDescription.trim()
      },
    });

  } else {
    console.log("Did not find an existing record for " + jobName + " and " + process.env.NEXT_PUBLIC_GPT_MODEL )

    await prisma.jobDescriptions.create({
      data: {
        gptModel: process.env.NEXT_PUBLIC_GPT_MODEL,
        jobName: lowerCaseJobName.trim(),
        jobDescription: jobDescription.trim()
      },
    });
  }
}

export async function getCachedResponse(jobName) {
  const lowerCaseJobName = jobName.toLowerCase();
  return await prisma.JobDescriptions.findFirst({
    where: {
      jobName: lowerCaseJobName,
      gptModel: process.env.NEXT_PUBLIC_GPT_MODEL
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}
