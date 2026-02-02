# Gemini + Supabase Migration Design

## Goal

Replace OpenAI with Google Gemini as the AI provider and replace MySQL/Prisma with Supabase for the database. Both changes are motivated by learning and simplifying deployment. The AI provider is abstracted so it can be swapped via an environment variable.

## Architecture

### API Route: `/src/pages/api/ai.js`

Replaces `/src/pages/api/openai.js`. Reads `AI_PROVIDER` env var (defaults to `gemini`) to determine which provider to call.

Flow:

1. Receive request with job title
2. Normalize job name (lowercase, trim)
3. Check cache via `genAiCache.js` (match on `job_name` + `ai_provider` + `ai_model`)
4. If cached, return cached response
5. If not cached, call the active AI provider
6. Store response in Supabase with provider + model metadata
7. Return response

Provider functions in the same file:

- `callGemini(prompt)` — Uses `@google/generative-ai` SDK, model: `gemini-3-flash-preview`
- `callOpenAi(prompt)` — Uses `openai` SDK, model from `OPENAI_MODEL` env var

Default provider: **Gemini**

### Cache: `/utils/genAiCache.js`

Replaces `/utils/openAiCache.js`. Uses Supabase JS client instead of Prisma. Provider-agnostic — stores and retrieves responses keyed by `job_name` + `ai_provider` + `ai_model`.

### Database Schema

Supabase `job_descriptions` table:

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` (PK) | Default `gen_random_uuid()` |
| `job_name` | `text` | Stored lowercase for case-insensitive matching |
| `response` | `text` | Full AI-generated response |
| `ai_provider` | `text` | e.g., `gemini`, `openai` |
| `ai_model` | `text` | e.g., `gemini-3-flash-preview`, `gpt-4` |
| `created_at` | `timestamptz` | Auto-set on insert |
| `updated_at` | `timestamptz` | Auto-set on insert and update |

Cache lookup matches on `job_name` + `ai_provider` + `ai_model` so different providers/models produce separate cached entries for comparison.

## Environment Variables

| Variable | Required | Default | Notes |
|---|---|---|---|
| `AI_PROVIDER` | No | `gemini` | `gemini` or `openai` |
| `GEMINI_API_KEY` | Yes (if Gemini) | — | Google API key |
| `OPENAI_API_KEY` | Yes (if OpenAI) | — | OpenAI API key |
| `OPENAI_MODEL` | No | — | Model name when using OpenAI |
| `SUPABASE_URL` | Yes | — | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | — | Supabase publishable key |

## Frontend Changes

- `/src/pages/index.js` — Update fetch URL from `/api/openai` to `/api/ai`
- `/components/Footer.js` — Dynamically display active provider/model instead of hardcoded "ChatGPT"

## Dependency Changes

- **Remove:** `@prisma/client`, `prisma`
- **Add:** `@google/generative-ai`, `@supabase/supabase-js`
- **Keep & upgrade:** `openai`

## Files to Delete

- `/src/pages/api/openai.js`
- `/utils/openAiCache.js`
- `/prisma/` (entire directory)
- `fly.toml` — Fly.io config (moving away from Fly.io)
- `.github/workflows/flyio.yml` — Fly.io CI/CD pipeline
- `Dockerfile` — Fly.io deployment container

Deployment target is TBD (AWS exploration planned separately).
