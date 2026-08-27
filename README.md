<p align="center">
  <img src="public/brand/full-logo.png" alt="CaliGuide" width="240">
</p>

<p align="center">
  Multilingual, source-backed guidance and community support for newcomers to California.
</p>

<p align="center">
  <a href="https://www.caliguide.org"><strong>Visit CaliGuide</strong></a>
  ·
  <a href="docs/CALIGUIDE_HANDOFF.md">Engineering documentation</a>
  ·
  <a href="docs/DATA_INVENTORY.md">Data inventory</a>
</p>

## About CaliGuide

CaliGuide helps newcomers navigate everyday life in California through practical guides, community discussions, and AI-assisted answers. The platform brings together cited official information, multilingual content, saved resources, and personalized support in one accessible experience.

The product is designed for people preparing to move to California as well as recent arrivals who need help understanding unfamiliar systems such as transportation, housing, banking, healthcare, employment, and public services.

> CaliGuide provides general educational information, not legal, medical, or financial advice. Sensitive guides include topic-specific notices and links to official sources.

## Key Features

- **Source-backed guides** with section-level citations, official links, review dates, and topic-specific disclaimers.
- **Multilingual interface** supporting English, Simplified Chinese, Traditional Chinese, Cantonese, and Spanish modes.
- **Community forum** with posts, comments, voting, saved posts, image attachments, reporting, and on-demand translation.
- **CaliBot assistant** with streamed responses, image understanding, conversation history, and optional user-level memory through Mem0.
- **Personalized library** for saved guides, saved forum posts, account information, and user activity.
- **Secure accounts** powered by Supabase Auth, including email/password and Google sign-in flows.
- **Media storage** in Cloudflare R2 for profile photos, forum images, and chatbot attachments.
- **Privacy controls** for consent preferences, account-data export, and account deletion.
- **Responsive experience** designed for both mobile and desktop use.

## Architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 | Interface, routing, localization, and client state |
| Application API | Express 4 | Authentication-aware APIs, uploads, forum actions, translation, and chat streaming |
| Authentication and database | Supabase Auth and PostgreSQL | Users, profiles, guides, forum data, chat history, saved content, and moderation records |
| Object storage | Cloudflare R2 | Avatars, forum images, chatbot images, and platform media |
| AI | OpenAI SDK with Baidu Qianfan's OpenAI-compatible endpoint | CaliBot text, vision, and on-demand forum translation |
| Long-term memory | Mem0 | Optional cross-conversation user memory for CaliBot |
| Runtime and tooling | Bun, Node.js, esbuild | Dependency management, tests, local development, and production builds |

The frontend and Express API are deployed as one full-stack application by default. A static frontend deployment must configure `VITE_API_BASE_URL` to point to a separately deployed API; otherwise routes such as `/api/chat` and `/api/uploads/*` will not exist.

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- Node.js 20 or newer for the production server
- A Supabase project for authentication and persistent data
- Optional service credentials for CaliBot, Mem0, and Cloudflare R2

### Local Development

```bash
git clone https://github.com/yangzh0728-lgtm/CaliGuide.git
cd CaliGuide
bun install
cp .env.example .env
bun run dev
```

Open [http://localhost:3000](http://localhost:3000).

The interface can start with partial configuration, but authentication, persistent data, chat, translation, and uploads require their corresponding services.

## Environment Variables

Never commit `.env` or server credentials. Browser variables prefixed with `VITE_` are public by design; service-role, AI, memory, and R2 credentials must remain server-side.

| Variable | Required for | Scope |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase Auth and browser data access | Browser |
| `VITE_SUPABASE_ANON_KEY` | Supabase Auth and browser data access | Browser |
| `SUPABASE_SERVICE_ROLE_KEY` | Protected server operations, translation cache, account export/deletion | Server only |
| `API_KEY` | CaliBot and model-backed forum translation | Server only |
| `APP_ID` | Qianfan OpenAI-compatible API endpoint | Server only |
| `CHAT_MODEL` | Optional text-model override | Server only |
| `CHAT_VISION_MODEL` | Optional vision-model override | Server only |
| `TRANSLATION_MODEL` | Optional forum-translation model override | Server only |
| `MEM0_API_KEY` | Optional cross-session CaliBot memory | Server only |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare R2 uploads | Server only |
| `R2_ACCESS_KEY_ID` | Cloudflare R2 uploads | Server only |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 uploads | Server only |
| `R2_BUCKET_NAME` | Cloudflare R2 uploads | Server only |
| `R2_PUBLIC_BASE_URL` | Publicly displaying uploaded media | Server configuration |
| `VITE_API_BASE_URL` | Static frontend connected to a separate API | Browser |
| `CORS_ALLOWED_ORIGINS` | Cross-origin frontend/API deployment | Server only |
| `APP_URL` | OAuth callbacks and self-referential server URLs | Server only |
| `TRUST_PROXY_HOPS` | Correct client IP handling behind trusted proxies | Server only |

See [.env.example](.env.example) for descriptions and example values.

## Available Scripts

| Command | Purpose |
| --- | --- |
| `bun run dev` | Start the Express API and Vite development server |
| `bun test` | Run the automated test suite |
| `bun run typecheck` | Run TypeScript validation without emitting files |
| `bun run lint` | Compatibility alias for the current typecheck command; a dedicated linter is not configured yet |
| `bun run build` | Build the frontend and bundle the production server into `dist/` |
| `bun run start` | Start the bundled production server |
| `bun run bench:chat` | Measure first-chunk latency, total response time, and estimated generation speed |
| `bun run import:guide-content` | Validate and import structured guide content into Supabase |
| `bun run migrate:r2-avatars` | Move legacy avatar objects into the current R2 user layout |
| `bun run seed:r2-structure` | Create development placeholder objects for the planned R2 structure |
| `bun run clean` | Remove generated build output |

## Repository Structure

```text
src/
  components/       Shared interface components
  context/          Authentication, language, and privacy state
  lib/              Data access, integrations, validation, and domain logic
  pages/            Main application views
content/            Structured guide content and import documentation
docs/               Engineering handoff, privacy inventory, and design plans
schemas/            JSON schemas for content validation
scripts/            Content, storage, migration, and benchmark utilities
supabase/           Versioned SQL setup and repair scripts
server.ts           Express API and production application server
```

## Data and Media Model

Supabase is the source of truth for user accounts, profiles, guides, forum activity, saved content, chat history, and moderation data. Cloudflare R2 stores binary media rather than database blobs.

```text
assets/users/{user_id}/profile/{file}
assets/users/{user_id}/forum/{post_id}/{file}
assets/users/{user_id}/chat/{file}
assets/platform/guide/{guide_id}/{file}
assets/platform/public/{file}
```

Guide content is validated against [schemas/guide-content.schema.json](schemas/guide-content.schema.json) before import. See [content/README.md](content/README.md) for the content workflow.

## Quality Checks

Before opening a pull request, run:

```bash
bun test
bun run typecheck
bun run build
```

The test suite covers localization parity, guide citations and disclaimers, authentication helpers, forum behavior, moderation, account-data controls, uploads, chat memory, and server integrations.

## Documentation

- [Engineering handoff](docs/CALIGUIDE_HANDOFF.md): architecture, service ownership, database model, API routes, deployment considerations, and regression checks.
- [Data inventory](docs/DATA_INVENTORY.md): collected data, subprocessors, browser storage, public exposure, and available user controls.
- [Content workflow](content/README.md): guide JSON structure, validation, and Supabase import.
- [Supabase migrations](supabase/): database tables, policies, permissions, translations, moderation, and repair scripts.

## Troubleshooting

### Supabase requests fail with a DNS or refresh-token error

Check the Supabase project status first. Free-tier projects may pause after inactivity. Resume the project, wait for it to become healthy, and then retry the request.

### A deployed site returns `404 Cannot POST /api/...`

The frontend is running without the Express API. Deploy the full application, or deploy the API separately and set `VITE_API_BASE_URL`. When using separate origins, configure `CORS_ALLOWED_ORIGINS` on the server.

### Media uploads fail

Confirm the R2 credentials, bucket name, and public media URL are present on the server. The normal upload path goes through Express to avoid browser-to-R2 CORS problems.

## Contributing

CaliGuide is under active development. Before submitting a substantial change, open an issue describing the problem, intended behavior, and any database or privacy impact. Changes should include focused tests and preserve behavior across all supported interface languages.

Do not include credentials, user data, production exports, or private service configuration in issues or pull requests.

## License

No open-source license has been granted for this repository yet. The source is publicly visible for evaluation, but reuse and redistribution require permission from the project owner.
