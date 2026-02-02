import { GoogleGenAI } from "@google/genai";
import OpenAI from "openai";
import { getCachedResponse, saveResponse } from "utils/genAiCache";

const aiProvider = process.env.AI_PROVIDER || "gemini";
const aiModel =
  aiProvider === "gemini"
    ? process.env.AI_MODEL || "gemini-2.5-flash"
    : process.env.AI_MODEL || "gpt-4";

async function callGemini(prompt) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const response = await ai.models.generateContent({
    model: aiModel,
    contents: prompt,
  });
  return response.text;
}

async function callOpenAi(prompt) {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: aiModel,
    messages: [{ role: "system", content: prompt }],
    temperature: 0.2,
  });
  return completion.choices[0].message.content;
}

function buildPrompt(job) {
  return (
    "You are a career counselor that helps people figure out what career they may be best suited for them. " +
    "They will give you a job title, and you will tell them " +
    "1. What does a " +
    job +
    " do every day? " +
    "2. How much money does a " +
    job +
    " make in Texas? " +
    "3. What kind of people enjoy being a " +
    job
  );
}

export default async function handler(req, res) {
  const job = (req.body.job || "").trim();

  if (job.length === 0) {
    res.status(400).json({
      error: { message: "Please enter a valid job" },
    });
    return;
  }

  const cachedResponse = await getCachedResponse(job, aiProvider, aiModel);

  if (cachedResponse) {
    console.log("Cache hit for:", job, aiProvider, aiModel);
    res.status(200).json({ result: cachedResponse });
    return;
  }

  console.log("Cache miss for:", job, aiProvider, aiModel);

  try {
    const prompt = buildPrompt(job);
    let result;

    if (aiProvider === "gemini") {
      result = await callGemini(prompt);
    } else if (aiProvider === "openai") {
      result = await callOpenAi(prompt);
    } else {
      res.status(400).json({
        error: { message: "Unknown AI_PROVIDER: " + aiProvider },
      });
      return;
    }

    await saveResponse(job, result, aiProvider, aiModel);
    res.status(200).json({ result });
  } catch (error) {
    console.error("AI API error:", error);

    const status = error?.status || error?.httpStatusCode || 500;
    let message = "An error occurred during your request.";

    if (status === 503 || /overloaded|unavailable/i.test(error.message)) {
      message = "The AI model is currently overloaded. Please try again in a moment.";
    } else if (status === 429) {
      message = "Too many requests. Please wait a moment and try again.";
    } else if (status === 401 || status === 403) {
      message = "There is an issue with the AI service configuration.";
    }

    res.status(status >= 400 && status < 600 ? status : 500).json({
      error: { message },
    });
  }
}
