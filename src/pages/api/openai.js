import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

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

  const capitalizedjob =
  job[0].toUpperCase() + job.slice(1).toLowerCase();

  try {


    const completion = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: generateMessages(capitalizedjob),
      temperature: 0.7,
      max_tokens: 300
    });
    console.log(completion.data.choices[0]);
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
    {"role": "system", "content": "You are a helpful assistant that helps people understand what a career in a certain field entails, and how much money someone can make, if they decided to pursue a career in said field"},
    {"role": "user", "content": 'Tell me what a day in the life of of a person who has the following job title may look like, and how much money can they make doing this job in Texas?' + job},
  ]

  return messages;

}
