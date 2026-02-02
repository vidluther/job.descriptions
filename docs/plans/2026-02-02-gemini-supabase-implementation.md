# Gemini + Supabase Migration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace OpenAI with Google Gemini and MySQL/Prisma with Supabase, abstracting the AI provider behind an environment variable.

**Architecture:** A single API route (`/api/ai`) reads `AI_PROVIDER` env var to dispatch to Gemini or OpenAI. Cache layer uses Supabase JS client keyed on job_name + provider + model. Fly.io deployment artifacts removed.

**Tech Stack:** Next.js 13, @google/genai, @supabase/supabase-js, openai (upgraded)

---

### Task 1: Create the Supabase `job_descriptions` table

**Context:** The existing MySQL table tracked `gptModel`, `jobName`, and `jobDescription`. The new table adds `ai_provider` and `ai_model` columns for cross-provider comparison.

**Step 1: Apply the migration via Supabase MCP**

Use the Supabase MCP `apply_migration` tool with project ID `qaqslpsfscjytcoixeio`:

```sql
create table job_descriptions (
  id uuid primary key default gen_random_uuid(),
  job_name text not null,
  response text not null,
  ai_provider text not null,
  ai_model text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index idx_job_descriptions_lookup
  on job_descriptions (job_name, ai_provider, ai_model);
```

Migration name: `create_job_descriptions_table`

**Step 2: Verify the table exists**

Use Supabase MCP `list_tables` for project `qaqslpsfscjytcoixeio`, schema `public`.

**Step 3: Commit**

Stage and commit: `feat: create job_descriptions table in Supabase`

---

### Task 2: Update dependencies

**Context:** Swap out Prisma for Supabase JS client, add Google GenAI SDK, upgrade OpenAI.

**Files:**
- Modify: `package.json`

**Step 1: Remove Prisma packages**

```bash
cd /Users/vluther/work/personal/job.descriptions && npm uninstall @prisma/client prisma
```

**Step 2: Add new packages**

```bash
cd /Users/vluther/work/personal/job.descriptions && npm install @google/genai @supabase/supabase-js
```

**Step 3: Upgrade OpenAI**

```bash
cd /Users/vluther/work/personal/job.descriptions && npm install openai@latest
```

**Step 4: Verify**

```bash
cd /Users/vluther/work/personal/job.descriptions && npm ls @google/genai @supabase/supabase-js openai
```

Should show all three packages installed. No `prisma` or `@prisma/client`.

**Step 5: Commit**

Stage `package.json` and `package-lock.json`. Commit: `chore: swap prisma for supabase-js, add @google/genai, upgrade openai`

---

### Task 3: Create the Supabase client utility

**Context:** Centralizes the Supabase client initialization so both the cache and any future code can import it.

**Files:**
- Create: `utils/supabaseClient.js`

**Step 1: Get project URL and anon key**

Use Supabase MCP `get_project_url` and `get_publishable_keys` for project `qaqslpsfscjytcoixeio`.

**Step 2: Update `.env`**

Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` values from Step 1. Also add:

```
AI_PROVIDER=gemini
AI_MODEL=gemini-3-flash-preview
```

Keep `GEMINI_API_KEY` (already present). Remove `DATABASE_URL` (no longer needed — Prisma is gone). Remove `NEXT_PUBLIC_GPT_MODEL` (replaced by `AI_MODEL`).

**Step 3: Write `utils/supabaseClient.js`**

```javascript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default supabase;
```

**Step 4: Commit**

Stage `utils/supabaseClient.js`. Commit: `feat: add Supabase client utility`

---

### Task 4: Create `utils/genAiCache.js`

**Context:** Replaces `utils/openAiCache.js`. Same caching logic but uses the Supabase JS client. Matches on `job_name` + `ai_provider` + `ai_model`.

**Files:**
- Create: `utils/genAiCache.js`

**Step 1: Write the cache module**

```javascript
import supabase from './supabaseClient';

export async function getCachedResponse(jobName, aiProvider, aiModel) {
  const lowerCaseJobName = jobName.toLowerCase().trim();

  const { data, error } = await supabase
    .from('job_descriptions')
    .select('response')
    .eq('job_name', lowerCaseJobName)
    .eq('ai_provider', aiProvider)
    .eq('ai_model', aiModel)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data.response;
}

export async function saveResponse(jobName, response, aiProvider, aiModel) {
  const lowerCaseJobName = jobName.toLowerCase().trim();

  const { error } = await supabase
    .from('job_descriptions')
    .upsert(
      {
        job_name: lowerCaseJobName,
        response: response.trim(),
        ai_provider: aiProvider,
        ai_model: aiModel,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'job_name,ai_provider,ai_model' }
    );

  if (error) {
    console.error('Error saving to cache:', error);
  }
}
```

**Step 2: Commit**

Stage `utils/genAiCache.js`. Commit: `feat: add genAiCache with Supabase backend`

---

### Task 5: Create `/src/pages/api/ai.js`

**Context:** Replaces `/src/pages/api/openai.js`. Reads `AI_PROVIDER` env var (defaults to `gemini`). Contains provider-specific functions and the shared prompt template.

**Files:**
- Create: `src/pages/api/ai.js`

**Step 1: Write the API route**

```javascript
import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { getCachedResponse, saveResponse } from 'utils/genAiCache';

const aiProvider = process.env.AI_PROVIDER || 'gemini';
const aiModel =
  aiProvider === 'gemini'
    ? process.env.AI_MODEL || 'gemini-3-flash-preview'
    : process.env.AI_MODEL || 'gpt-4';

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
    messages: [
      { role: 'system', content: prompt },
    ],
    temperature: 0.2,
  });
  return completion.choices[0].message.content;
}

function buildPrompt(job) {
  return (
    'You are a career counselor that helps people figure out what career they may be best suited for them. ' +
    'They will give you a job title, and you will tell them ' +
    '1. What does a ' + job + ' do every day? ' +
    '2. How much money does a ' + job + ' make in Texas? ' +
    '3. What kind of people enjoy being a ' + job
  );
}

export default async function handler(req, res) {
  const job = (req.body.job || '').trim();

  if (job.length === 0) {
    res.status(400).json({
      error: { message: 'Please enter a valid job' },
    });
    return;
  }

  const cachedResponse = await getCachedResponse(job, aiProvider, aiModel);

  if (cachedResponse) {
    console.log('Cache hit for:', job, aiProvider, aiModel);
    res.status(200).json({ result: cachedResponse });
    return;
  }

  console.log('Cache miss for:', job, aiProvider, aiModel);

  try {
    const prompt = buildPrompt(job);
    let result;

    if (aiProvider === 'gemini') {
      result = await callGemini(prompt);
    } else if (aiProvider === 'openai') {
      result = await callOpenAi(prompt);
    } else {
      res.status(400).json({
        error: { message: 'Unknown AI_PROVIDER: ' + aiProvider },
      });
      return;
    }

    await saveResponse(job, result, aiProvider, aiModel);
    res.status(200).json({ result });
  } catch (error) {
    console.error('AI API error:', error);
    res.status(500).json({
      error: { message: 'An error occurred during your request.' },
    });
  }
}
```

**Step 2: Commit**

Stage `src/pages/api/ai.js`. Commit: `feat: add provider-agnostic AI API route`

---

### Task 6: Update the frontend

**Context:** Update the fetch URL and footer to reflect the new API route and dynamic provider info.

**Files:**
- Modify: `src/pages/index.js` (line 79: change `/api/openai` to `/api/ai`)
- Modify: `components/Footer.js` (replace hardcoded "OpenAI ChatGPT" with env var)

**Step 1: Update `src/pages/index.js`**

Change line 79 from:

```javascript
const response = await fetch("/api/openai", {
```

to:

```javascript
const response = await fetch("/api/ai", {
```

**Step 2: Update `components/Footer.js`**

Replace the entire file content. Change the provider/model line to read from `NEXT_PUBLIC_AI_PROVIDER` and `NEXT_PUBLIC_AI_MODEL` env vars:

```javascript
import Link from 'next/link';

const version = process.env.NEXT_PUBLIC_APP_VERSION;
const aiProvider = process.env.NEXT_PUBLIC_AI_PROVIDER || 'gemini';
const aiModel = process.env.NEXT_PUBLIC_AI_MODEL || 'gemini-3-flash-preview';

export default function Footer() {
  return (
    <footer className="py-4">
      <div className="container mx-auto">
        <p className="text-gray-500 text-sm text-center">
          Hacked together by{' '}
          <Link className="text-gray-700 hover:text-gray-900" href="https://luther.io">
            Vid Luther
          </Link>{' '} in 2023  <br />
          powered by {aiProvider} model {aiModel}
        </p>
        <p className="text-gray-500 text-sm text-center"> build info: {version} </p>
        <br />
        <div className="text-blue-500 text-sm text-center">
          <Link href="https://plausible.io/jd.luther.io?goal=Looked+Up"> Curious what other people searched for? .. </Link>
        </div>
      </div>
    </footer>
  );
}
```

**Step 3: Update `.env` with NEXT_PUBLIC vars**

Add to `.env`:

```
NEXT_PUBLIC_AI_PROVIDER=gemini
NEXT_PUBLIC_AI_MODEL=gemini-3-flash-preview
```

**Step 4: Commit**

Stage `src/pages/index.js` and `components/Footer.js`. Commit: `feat: update frontend to use /api/ai and dynamic provider display`

---

### Task 7: Delete old files

**Context:** Remove all Prisma, old API route, old cache, and Fly.io deployment artifacts.

**Files to delete:**
- `src/pages/api/openai.js`
- `utils/openAiCache.js`
- `prisma/` (entire directory)
- `fly.toml`
- `.github/workflows/flyio.yml`
- `Dockerfile`

**Step 1: Delete the files**

```bash
cd /Users/vluther/work/personal/job.descriptions && rm -f src/pages/api/openai.js utils/openAiCache.js fly.toml Dockerfile .github/workflows/flyio.yml && rm -rf prisma/
```

**Step 2: Remove empty `.github/workflows` directory if empty**

```bash
rmdir /Users/vluther/work/personal/job.descriptions/.github/workflows 2>/dev/null; rmdir /Users/vluther/work/personal/job.descriptions/.github 2>/dev/null; true
```

**Step 3: Commit**

Stage all deletions. Commit: `chore: remove prisma, fly.io, and old openai files`

---

### Task 8: Smoke test

**Context:** Verify everything works end to end.

**Step 1: Start the dev server**

```bash
cd /Users/vluther/work/personal/job.descriptions && npm run dev
```

**Step 2: Test the API**

```bash
curl -X POST http://localhost:3000/api/ai -H "Content-Type: application/json" -d '{"job": "nurse"}'
```

Expected: JSON response with `result` field containing Gemini-generated job description.

**Step 3: Verify cache**

Run the same curl command again. Check server logs for "Cache hit" message.

**Step 4: Verify Supabase**

Use Supabase MCP `execute_sql` to query: `SELECT * FROM job_descriptions LIMIT 5;`

Should show one row for "nurse" with `ai_provider = 'gemini'` and `ai_model = 'gemini-3-flash-preview'`.
