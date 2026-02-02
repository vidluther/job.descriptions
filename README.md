# AI Job Descriptions

A Next.js app that uses AI to describe what different jobs are like day-to-day, what they pay in Texas, and what kind of people enjoy them. Enter a job title and get a detailed breakdown.

The goal is to eventually tie this into <https://texaswfc.com>, where people can see what a specific job entails, how much it pays, and decide if they want to take a course for it.

## Architecture

- **Frontend:** Next.js 13 with React and TailwindCSS
- **AI Provider:** Configurable via `AI_PROVIDER` env var (supports `gemini` and `openai`)
- **Cache/Database:** Supabase (Postgres) — responses are cached by job name + provider + model
- **API Route:** `/api/ai` dispatches to the configured provider
- **Analytics:** Plausible via `next-plausible`

## Setup

1. Install [Node.js](https://nodejs.org/en/) (>= 14.6.0)

2. Clone this repository and install dependencies:

   ```bash
   cd job.descriptions
   pnpm install
   ```

3. Copy the example environment file and fill in your keys:

   ```bash
   cp env.example .env
   ```

4. Run the app:

   ```bash
   pnpm run dev
   ```

   The app will be at [http://localhost:3000](http://localhost:3000).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `AI_PROVIDER` | No | `gemini` (default) or `openai` |
| `AI_MODEL` | No | Model name (defaults to `gemini-3-flash-preview` or `gpt-4` depending on provider) |
| `GEMINI_API_KEY` | If using Gemini | Google AI Studio API key |
| `OPENAI_API_KEY` | If using OpenAI | OpenAI API key |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/publishable key |
| `NEXT_PUBLIC_AI_PROVIDER` | No | Displayed in footer |
| `NEXT_PUBLIC_AI_MODEL` | No | Displayed in footer |
| `NEXT_PUBLIC_APP_VERSION` | No | Build version displayed in footer |

## Key Files

```
src/pages/api/ai.js      # API route — provider dispatch, caching, prompt
src/pages/index.js        # Main page — job title input form
components/Footer.js      # Footer with provider/model info
utils/supabaseClient.js   # Supabase client singleton
utils/genAiCache.js       # Cache read/write using Supabase
```
