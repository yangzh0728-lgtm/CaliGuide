# CaliGuide

CaliGuide is a React and Express app for California immigration guidance. It includes a Vite frontend, an Express development server, and a Gemini-powered chat API at `/api/chat`.

View your app in AI Studio: https://ai.studio/apps/7d845aca-bd91-45d0-95d5-64d4c738a08b

## Tech Stack

- React 19
- Vite 6
- Express
- TypeScript
- Tailwind CSS
- Bun for dependency management and scripts
- Gemini via `@google/genai`

## Prerequisites

- Bun
- Node.js, used by the `tsx` development runner and the production server
- A Gemini API key for chat responses

## Run Locally

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Set `GEMINI_API_KEY` in `.env`.

   The app will still start without a key, but `/api/chat` returns an error until the key is configured.

4. Start the development server:

   ```bash
   bun run dev
   ```

5. Open the app:

   http://localhost:3000

## Scripts

- `bun run setup` installs dependencies.
- `bun run dev` starts the Express and Vite development server.
- `bun run typecheck` runs TypeScript without emitting files.
- `bun run lint` aliases the typecheck command.
- `bun run build` builds the frontend and bundles the server into `dist/`.
- `bun run start` runs the production server from `dist/server.cjs`.
- `bun run clean` removes generated build output.

## Troubleshooting

If `bun run dev` fails inside the Codex desktop environment with a Rollup native module signing error, run it with the bundled runtime Node first in `PATH`:

```bash
env PATH=/Users/mac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ~/.bun/bin/bun run dev
```

That avoids the hardened `Node.js` binary bundled inside `Codex.app`, which can reject Rollup's native addon on macOS.
