# Markdown Response Rendering

## Problem

The AI response display in `apiResponse.js` uses fragile custom parsing (split on `\n\n` + digit patterns, `dangerouslySetInnerHTML`) that breaks depending on AI output format.

## Solution

Request markdown from the AI and render it with `react-markdown`.

## Changes

1. `src/pages/api/ai.js` — Update `buildPrompt()` to request markdown formatting
2. `components/apiResponse.js` — Replace custom parsing with `<ReactMarkdown>`, use Tailwind `prose` classes
3. `package.json` — Add `react-markdown`, `@tailwindcss/typography`
4. `tailwind.config.js` — Add typography plugin

## Notes

- Existing cached responses (plain text) will render fine through react-markdown
- Eliminates `dangerouslySetInnerHTML` (security improvement)
