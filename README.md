<p align="center">
  <img src="public/brand/full-logo.png" alt="CaliGuide" width="240">
</p>

<p align="center">
  <strong>A clearer start in California, in a language you read.</strong>
</p>

<p align="center">
  <a href="https://www.caliguide.org"><strong>Visit CaliGuide</strong></a>
  ·
  <a href="#why-this-exists">Why this exists</a>
  ·
  <a href="#what-makes-it-different">What makes it different</a>
  ·
  <a href="#getting-started">Run it locally</a>
</p>

---

An appointment can become a wasted trip when you bring the wrong documents. A move
can mean updating several agencies and accounts, each with a different process.
Finding the right instructions should not be the hardest part of starting over.

Moving to California means learning unfamiliar systems for housing, transportation,
banking, healthcare, employment, and public services. The information exists, but it
is often spread across agencies and difficult to navigate in an unfamiliar language.

CaliGuide brings practical guides, official-source links, community discussions,
and AI-assisted answers into one multilingual starting point.

## Why this exists

The moving and address-change guide captures the problem CaliGuide aims to solve:
what needs updating, in what order, and which steps have deadlines? Forwarding mail,
updating government records, and changing utility accounts are connected tasks, but
their instructions rarely live together.

CaliGuide organizes information around those everyday tasks, helping people find
the right agency, prepare their next step, and check the source before acting.

## What makes it different

**20 guides · 69 cited references · 27 agencies · 5 interface languages**

**Sources alongside the guidance.** Guide sections link to references with a
publisher, a description of what the source supports, and a recorded review date.
Readers can consult the original guidance instead of relying on a summary alone.

**Five interface languages.** English, Simplified Chinese, Traditional Chinese,
Cantonese, and Spanish. Guide content is maintained in the repository rather than
translated on demand; Cantonese mode currently shares Traditional Chinese guide
content. Community posts can be translated on demand through Azure Translator.

**No behavioral analytics.** The app does not include Google Analytics, Segment,
PostHog, or advertising tracking pixels. Operational error reporting and external
services still process some data; the [data inventory](docs/DATA_INVENTORY.md)
explains those flows.

**Preview first, then sign in.** First 30 Days in California and the California DMV
agency page are public samples. The full guide and agency libraries, forum posts
and replies, chat, and personal features require an account. Trust pages remain public.

**Sensitive topics are clearly marked.** Guides covering legal, medical, or
financial topics include notices explaining the limits of general information.

**Anyone can report a correction.** No account is needed to flag outdated guidance,
broken links, or translation problems. Reports enter a private review queue.

> CaliGuide provides general educational information, not legal, medical, or financial advice. Sensitive guides include topic-specific notices and links to official sources.

## Features

- **Guide library** with shareable URLs, topic filters, section-level citations, official action links, review dates, and topic-specific disclaimers. One sample is public; other guides require sign-in.
- **Agency directory** organized by need, with agency responsibilities, common points of confusion, official resources, and related guides.
- **Multilingual interface** supporting English, Simplified Chinese, Traditional Chinese, Cantonese, and Spanish modes.
- **Community forum** with posts, comments, voting, saved posts, image attachments, reporting, and on-demand translation.
- **CaliBot assistant** with streamed responses, image understanding, conversation history, and optional user-level memory through Mem0.
- **Personal dashboard** with saved resources, recent conversations, arrival-stage guide suggestions, and an account-synced moving checklist.
- **Flexible registration** through Supabase Auth: email and password are required; the separately labeled profile fields can all be left blank. Google sign-in is also available. A later sign-in can offer a dismissible reminder for missing details, with a 30-day pause or a permanent opt-out.
- **Media storage** in Cloudflare R2 for profile photos, forum images, and chatbot attachments.
- **Privacy controls** for consent preferences, account-data export, and account deletion.
- **Guide correction reporting** for outdated information, factual errors, broken links, translation problems, and unclear guidance, with no account required to submit a report.
- **Responsive experience** designed for both mobile and desktop use.

## Architecture

| Layer | Technology | Responsibility |
| --- | --- | --- |
| Frontend | React 19, TypeScript, Vite 6, Tailwind CSS 4 | Interface, routing, localization, and client state |
| Application API | Express 4 | Authentication-aware APIs, uploads, forum actions, translation, and chat streaming |
| Authentication and database | Supabase Auth and PostgreSQL | Accounts, profiles, checklist progress, forum data, chat history, saved content, report queues, and imported content records |
| Object storage | Cloudflare R2 | Avatars, forum images, chatbot images, and platform media |
| Chat AI | OpenAI SDK with Baidu Qianfan's OpenAI-compatible endpoint | CaliBot text and vision |
| Translation | Microsoft Azure AI Translator | On-demand forum translation |
| Long-term memory | Mem0 | Optional cross-conversation user memory for CaliBot |
| Runtime and tooling | Bun, Node.js, esbuild | Dependency management, tests, local development, and production builds |

The frontend and Express API are deployed as one full-stack application by default. A static frontend deployment must configure `VITE_API_BASE_URL` to point to a separately deployed API; otherwise routes such as `/api/chat` and `/api/uploads/*` will not exist.

Data handling, including which third parties receive user content, is documented
in the [data inventory](docs/DATA_INVENTORY.md).

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/)
- Node.js 20 or newer for the production server
- A Supabase project for authentication and persistent data
- Service credentials for Azure AI Translator and optional credentials for CaliBot, Mem0, and Cloudflare R2

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
| `API_KEY` | CaliBot text and vision | Server only |
| `APP_ID` | Qianfan OpenAI-compatible API endpoint | Server only |
| `CHAT_MODEL` | Optional text-model override | Server only |
| `CHAT_VISION_MODEL` | Optional vision-model override | Server only |
| `AZURE_TRANSLATOR_KEY` | Azure AI Translator authentication | Server only |
| `AZURE_TRANSLATOR_ENDPOINT` | Azure AI Translator API endpoint | Server only |
| `AZURE_TRANSLATOR_REGION` | Required for regional Azure Translator resources; blank for Global | Server only |
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
| `bun run test:e2e` | Run Playwright browser tests on desktop and mobile Chromium |
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
  hooks/            Shared stateful behavior, including checklist synchronization
  i18n/             Interface translations and localized workflow copy
  lib/              Data access, integrations, validation, and domain logic
  pages/            Main application views
content/            Structured guide content and import documentation
e2e/                Browser-level workflow tests
docs/               Privacy inventory and design documentation
schemas/            JSON schemas for content validation
scripts/            Content, storage, migration, and benchmark utilities
supabase/           Versioned SQL setup and repair scripts
server.ts           Express API and production application server
```

## Data and Media Model

Supabase stores user accounts, profiles, signed-in checklist progress, forum activity, saved content, chat history, and moderation data. Profile and checklist access is scoped to the account owner; report queues are not exposed to browser roles. Cloudflare R2 stores binary media rather than database blobs.

The guide library currently renders bundled content from `src/lib/blogContent.ts` and its localization modules. Sign-in gates the reading interface, not access to the underlying bundled article data. The separate structured-content import workflow writes normalized records to Supabase; importing content alone does not update the bundled guide pages.

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

The test suite covers localization parity, guide formatting and citations, authentication helpers, forum behavior, moderation, account-data controls, checklist synchronization, uploads, chat memory, and server integrations.

For browser checks, install Chromium and run with placeholder Supabase configuration:

```bash
bunx playwright install chromium
VITE_SUPABASE_URL=https://example.supabase.co \
VITE_SUPABASE_ANON_KEY=sb_publishable_ci \
bun run test:e2e
```

Leave port 3000 available so Playwright starts its own application server with this configuration instead of reusing a running development server. Account workflow tests mock external services; they do not create real accounts or verify production OAuth.

[GitHub Actions](.github/workflows/ci.yml) runs unit tests, TypeScript checks, production builds, desktop/mobile browser tests, and database-permission assertions against disposable PostgreSQL. Browser coverage includes public navigation, minimal signup, optional profile prompts, guide reporting, saved guides, and checklist persistence. The SQL fixtures under `supabase/tests/` are for testing only, not production setup.

## Documentation

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

Native speakers can help by flagging unclear or unnatural translations. Use the
guide's correction form or open an issue with the language, guide link, and
suggested wording.

Do not include credentials, user data, production exports, or private service configuration in issues or pull requests.

## Security

Report vulnerabilities privately through GitHub's [Security tab](https://github.com/yangzh0728-lgtm/CaliGuide/security), not as a public issue. See [SECURITY.md](SECURITY.md) for scope, testing rules, and response times.

Authorization relies on server checks, database permissions, and Supabase Row Level
Security, not on keeping the source code or publishable key secret. Report suspected
cross-account access privately and follow the testing rules in the security policy.

## License

This repository uses two licenses, because code and editorial content are different kinds of work.

**Code — [Apache License 2.0](LICENSE)**

Everything not listed under Content below, including `server.ts`, `src/components/`, `src/pages/`, `src/context/`, `scripts/`, and `supabase/`.

**Content — [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/)**

The researched guide text, official-source citations, and agency directory entries:

```text
src/lib/blogContent.ts
src/lib/blogLocalization.ts
src/lib/blogBodyTranslations.ts
src/lib/guideCitations.ts
content/
docs/
```

Reuse is welcome with attribution to CaliGuide and a link to this repository. Derivative content must be shared under the same license.

**Name and mark**

Apache License Section 6 does not grant rights to the CaliGuide name. Forks and derivative works must use a different name. See [NOTICE](NOTICE).

**No warranty**

Both licenses provide this work as is, without warranties. Guide content is general information, not legal, medical, financial, or immigration advice. See the [Content Disclaimer](https://www.caliguide.org/disclaimer).
