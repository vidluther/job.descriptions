# CLAUDE.md

Project context for AI agents working on this codebase.

## What This Is

A Next.js 13 app that generates job descriptions using AI. Users enter a job title and get back daily responsibilities and personality fit. Live at `jd.luther.io`.

## Tech Stack

- **Framework:** Next.js 13 (Pages Router, not App Router)
- **Styling:** TailwindCSS 3
- **Formatting:** oxfmt (`npm run fmt`, `npm run fmt:check`, `npm run fmt:fix`)
- **AI:** Google Gemini (`@google/genai`) as default, OpenAI as alternative — controlled by `AI_PROVIDER` env var
- **Rendering:** `react-markdown` with `@tailwindcss/typography` for rendering AI responses as styled markdown
- **Database/Cache:** Supabase (Postgres) via `@supabase/supabase-js` — project ID: `qaqslpsfscjytcoixeio`
- **Analytics:** Plausible (`next-plausible`)

## Architecture Decisions

- **Provider abstraction:** `AI_PROVIDER` env var (`gemini` or `openai`) selects which AI backend to call. Default provider is `gemini`, default model is `gemini-2.5-flash`. The API route `/api/ai` reads this at startup and dispatches accordingly. Adding a new provider means adding a `callX()` function and a new branch in the handler.
- **Caching:** Responses are cached in a Supabase `job_descriptions` table keyed on `(job_name, ai_provider, ai_model)`. This means the same job queried with different providers/models produces separate cache entries for comparison.
- **No Prisma:** Previously used Prisma + MySQL. Migrated to Supabase JS client directly (Feb 2026). No ORM.
- **No Fly.io:** Previously deployed on Fly.io. Deployment artifacts (Dockerfile, fly.toml, GitHub Actions workflow) were removed in Feb 2026. Deployment target is TBD.
- **Markdown responses:** The AI prompt explicitly requests markdown formatting (`Format your response in markdown with headers and bullet points`). Responses are rendered client-side via `react-markdown` with Tailwind Typography prose classes.
- **RLS disabled:** The `job_descriptions` table has RLS disabled. The anon key is only used server-side in the API route, not exposed to the browser. If the Supabase client is ever used client-side, RLS policies must be added.

## Project Structure

```
src/pages/api/ai.js       # Single API route — prompt, provider dispatch, cache check
src/pages/api/hello.js    # Default Next.js hello endpoint (unused)
src/pages/index.js        # Main page with job title input and rotating title carousel
src/pages/_app.js         # App wrapper (Plausible provider)
src/pages/_document.js    # Custom document
src/styles/globals.css    # Global styles (Tailwind directives)
src/styles/Home.module.css # Legacy CSS module (mostly unused)
components/Footer.js      # Footer with provider/model display, links to Plausible stats
components/apiResponse.js # Renders AI response as styled markdown via react-markdown
utils/supabaseClient.js   # Supabase client singleton
utils/genAiCache.js       # getCachedResponse() and saveResponse()
docs/plans/               # Feature design documents (created during brainstorming)
```

## Environment Variables

Server-side: `AI_PROVIDER`, `AI_MODEL`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_ANON_KEY`

Client-side (NEXT*PUBLIC*): `NEXT_PUBLIC_AI_PROVIDER`, `NEXT_PUBLIC_AI_MODEL`, `NEXT_PUBLIC_APP_VERSION`

## Supabase Schema

Table `public.job_descriptions`:

- `id` uuid (PK, auto-generated)
- `job_name` text
- `response` text
- `ai_provider` text
- `ai_model` text
- `created_at` timestamptz
- `updated_at` timestamptz
- Unique index on `(job_name, ai_provider, ai_model)`

## Common Tasks

- **Run dev server:** `npm run dev` (port 3000)
- **Format code:** `npm run fmt` (uses oxfmt; `fmt:check` to verify, `fmt:fix` to auto-fix)
- **Test API:** `curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d '{"job": "nurse"}'`
- **Switch provider:** Change `AI_PROVIDER` in `.env` to `openai` and set `OPENAI_API_KEY`
- **Check cache:** Query Supabase: `SELECT job_name, ai_provider, ai_model, created_at FROM job_descriptions;`
