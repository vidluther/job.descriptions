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


    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(capitalizedjob),
      temperature: 0.7,
      max_tokens: 300
    });
    //console.log(completion.data.choices[0]);
    res.status(200).json({ result: completion.data.choices[0].text });
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

function generatePrompt(job) {

  return `I am thinking of taking a class that teaches ${job}, before I take this class, I want to know
  what I will be doing at work if I pursue a career in this field? And how much money can I make
  in Texas, if I take this job?

job: ${job}
Description:
Salary Range:
`;
}
