import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);
import { getCachedResponse, saveApiResponse } from 'utils/openAiCache';

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const job = req.body.job || '';
  if (job.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid job",
      }
    });
    return;
  }


  const cachedResponse = await getCachedResponse(job);

  if (cachedResponse) {
    console.log("Using cached response", cachedResponse.jobDescription);
    res.status(200).json({ result: cachedResponse.jobDescription });
    return
  } else {
    console.log("Nothing found in our local cache db for " + job);
  }

  try {


    const completion = await openai.createChatCompletion({
      model: process.env.NEXT_PUBLIC_GPT_MODEL,
      messages: generateMessages(job),
      temperature: 0.2
    });
    console.log(completion.data.choices[0]);
    // Save the API response to the cache
    await saveApiResponse(job, completion.data.choices[0].message.content);
    res.status(200).json({ result: completion.data.choices[0].message.content });
  } catch(error) {
    // Consider adjusting the error handling logic for your use case
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

function generateMessages(job) {
  console.log("looking up " + job)

  const messages = [
    {"role": "system",
      "content":
      "You are a career counselor that helps people figure out what career they may be best suited for them. They will give you a job title, and you will tell them 1. What does a " + job + " do ever day?. 2. How much money does a " + job + " make in Texas? 3. What kind of people enjoy being a " + job},
    {"role": "user", "content": job},
  ]

  return messages;

}
