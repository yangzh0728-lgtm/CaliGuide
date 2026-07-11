# CaliGuide

CaliGuide is a React and Express app for California immigration guidance. It includes a Vite frontend, an Express development server, and an OpenAI SDK-powered chat API at `/api/chat`.

View your app in AI Studio: https://ai.studio/apps/7d845aca-bd91-45d0-95d5-64d4c738a08b

## Tech Stack

- React 19
- Vite 6
- Express
- TypeScript
- Tailwind CSS
- Bun for dependency management and scripts
- OpenAI SDK via `openai`

## Prerequisites

- Bun
- Node.js, used by the `tsx` development runner and the production server
- Qianfan-compatible `API_KEY` and `APP_ID` values for chat responses
- Optional `MEM0_API_KEY` for CaliBot user-level long-term memory

## Run Locally

1. Install dependencies:

   ```bash
   bun install
   ```

2. Create a local environment file:

   ```bash
   cp .env.example .env
   ```

3. Set `API_KEY` and `APP_ID` in `.env`.

   `CHAT_MODEL` is optional. Leave it blank to use the server default, or set it to a model such as `deepseek-v4-flash`.

   `CHAT_VISION_MODEL` is used only when a chatbot message includes images. CaliBot defaults to Qianfan's `ernie-4.5-turbo-vl`; set this variable only when you want another vision-capable model from the same OpenAI-compatible provider.

   `MEM0_API_KEY` is optional. Add it to enable user-level long-term memory through mem0. Without it, CaliBot still streams replies, but it will not remember user facts across sessions.

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
- `bun run migrate:r2-avatars` copies old R2 avatar objects into `assets/users/{user_id}/profile/` and updates Supabase profile URLs.
- `bun run seed:r2-structure` uploads JSON mock objects to R2 so the planned folder structure is visible in Cloudflare.

## Supabase Password Reset

The forgot password flow uses Supabase Auth email recovery links. In the Supabase dashboard, add your app URLs under **Authentication > URL Configuration**:

- Site URL: your production app URL
- Redirect URLs: `http://localhost:3000/*` for local development and your production URL pattern

The app sends reset emails with a redirect back to `/?password-recovery=1`, then lets the user set a new password after Supabase opens a recovery session.

## Cloudflare R2 Folder Structure

Uploaded media uses this R2 object key layout:

```text
assets/users/{user_id}/profile/{file}
assets/users/{user_id}/forum/{post_id}/{file}
assets/users/{user_id}/chat/{file}
assets/platform/guide/{guide_id}/{file}
assets/platform/public/{file}
```

When a user signs in, the app also creates lightweight `_structure.json`
placeholder objects at `assets/users/{user_id}/profile/`,
`assets/users/{user_id}/forum/`, and `assets/users/{user_id}/chat/` so the
planned user folders are visible in Cloudflare R2 before that user has uploaded
media in every area.

The upload signing API accepts these folder values:

- `profile` for user profile photos.
- `forum` with `resourceId` set to the forum post id.
- `chat` for user chatbot media.
- `platform-guide` with `resourceId` set to the guide id.
- `platform-public` for shared marketing assets such as logos and favicons.

Forum and chatbot images upload to the same-origin app server first, then the
server writes the raw image file to Cloudflare R2. This avoids browser-to-R2
CORS problems during normal posting. A signed browser upload path remains as a
fallback; if you use that path directly, the R2 bucket CORS policy must allow
your local and production origins to `PUT` and `GET` objects with the
`Content-Type` header.

To create visible placeholder folders in Cloudflare R2 before real files exist, run:

```bash
bun run seed:r2-structure
```

The script uploads small JSON objects at:

```text
assets/users/user-demo-1/profile/mock-profile.json
assets/users/user-demo-1/forum/post-demo-1/mock-forum-image.json
assets/users/user-demo-1/chat/mock-chat-attachment.json
assets/platform/guide/guide-dmv-checklist/mock-guide-image.json
assets/platform/public/mock-logo.json
```

You can override the demo IDs in `.env` with `R2_MOCK_USER_ID`, `R2_MOCK_POST_ID`, and `R2_MOCK_GUIDE_ID`.

If older avatar uploads exist outside the profile folder, migrate them with:

```bash
bun run migrate:r2-avatars
```

To preview the changes without copying or updating Supabase, run:

```bash
bun run migrate:r2-avatars -- --dry-run
```

The migration copies each old avatar object into `assets/users/{user_id}/profile/` and updates the matching `profiles.avatar_url`. It keeps the old object in place as a backup.

If Supabase reports `permission denied for table profiles`, run `supabase/r2-avatar-migration-grants.sql` in Supabase SQL Editor, then rerun the migration.

## Guide and Blog Content Tables

Guide/blog content should use Supabase tables as the source of truth, while R2 stores article images and attachments.

Run this SQL in Supabase SQL Editor to create the content tables:

```text
supabase/guide-content-tables.sql
```

If the schema run fails partway through during first setup, run this reset SQL first, then run `supabase/guide-content-tables.sql` again:

```text
supabase/reset-guide-content-tables.sql
```

Use this JSON Schema when preparing guide/blog content for import:

```text
schemas/guide-content.schema.json
```

A fill-in template is available at:

```text
content/guide-content.template.json
```

After content is ready, import it into Supabase with:

```bash
bun run import:guide-content
```

The default import file is:

```text
content/california_newcomer_20_blogs_zh-CN.json
```

You can also import a specific file:

```bash
bun run import:guide-content content/california_newcomer_20_blogs_zh-CN.json
```

## Troubleshooting

If `bun run dev` fails inside the Codex desktop environment with a Rollup native module signing error, run it with the bundled runtime Node first in `PATH`:

```bash
env PATH=/Users/mac/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin:$PATH ~/.bun/bin/bun run dev
```

That avoids the hardened `Node.js` binary bundled inside `Codex.app`, which can reject Rollup's native addon on macOS.
