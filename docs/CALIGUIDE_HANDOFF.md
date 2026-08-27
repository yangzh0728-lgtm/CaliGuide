# CaliGuide Engineering Handoff

Last reviewed: August 26, 2026

This document is the starting point for the next developer. It describes the
current product, repository, services, deployment dependencies, database setup,
known risks, and the access that must be transferred. It intentionally contains
no secret values.

## 1. Product Summary

CaliGuide is a multilingual, mobile-first web application for immigrants and
newcomers navigating life in California. It combines:

- Official-source newcomer guides covering DMV, banking, housing, health,
  education, employment, transportation, taxes, and legal preparation.
- A community forum with search, topic filters, comments, votes, saved posts,
  image attachments, ownership-based deletion, and on-demand translation.
- CaliBot, a streaming AI assistant with image input, chat history, and optional
  user-level long-term memory through Mem0.
- Supabase authentication and personalized profiles, including saved guides,
  saved posts, account information, and user-created forum content.
- Cloudflare R2 storage for profile, forum, chatbot, guide, and platform media.

The interface supports English, Simplified Chinese, Traditional Chinese,
Cantonese, and Spanish. Forum translation currently offers English, Simplified
Chinese, Traditional Chinese, and Spanish as selectable targets.

## 2. Current Repository State

- Repository root: `/Users/mac/Desktop/CaliGuide`
- Primary branch: `main`
- Remote tracking branch: `origin/main`
- TypeScript, TSX, and SQL: approximately 20,504 lines in the current working
  tree, excluding generated output and dependencies.
- This handoff was prepared from the baseline commit below. The reviewed
  guide-disclaimer and privacy/legal work described here may be committed after
  this document was written, so always review `git status` and recent history.

The baseline commit for this review was:

```text
bd4e221 feat: add guide citations and references
```

### Verified working tree on August 26, 2026

```text
bun test          171 passed, 0 failed
bun run typecheck passed
bun run build     passed
git diff --check  passed
```

The production build reports that the main browser JavaScript chunk is about
982 KB before gzip and warns that it exceeds Vite's 500 KB chunk guideline.
The server CommonJS bundle also warns that `import.meta` is unavailable in CJS
for the browser-oriented helpers in `src/lib/apiUrl.ts`. The build completes,
but future work should split browser-only environment access from code bundled
into the server and introduce route-level or vendor code splitting.

## 3. Technology Stack

### Frontend

- React 19
- TypeScript 5.8
- Vite 6
- Tailwind CSS 4
- Motion
- Lucide React

### Backend

- Express 4
- TypeScript executed with `tsx` in development
- Bundled with esbuild for production
- OpenAI SDK pointed at a Qianfan-compatible API

### Data and infrastructure

- Supabase Auth and PostgreSQL
- Cloudflare R2 object storage through the AWS S3-compatible SDK
- Mem0 for optional long-term AI memory
- Bun for package installation, tests, and scripts
- AWS-hosted production environment, based on the current operational setup
- `caliguide.org` and `www.caliguide.org` as production domains

## 4. Important Architecture Notes

### Full-stack requirement

This is not a static-only Vite application. The Express server owns the chat,
translation, forum mutation, and image-upload APIs. A static host that serves
only `dist/index.html` will produce `404 Cannot POST /api/...` errors.

The preferred deployment is one Express service that serves both:

- The compiled Vite frontend.
- All `/api/*` routes.

If frontend and backend use separate hosts, set `VITE_API_BASE_URL` during the
frontend build and configure `CORS_ALLOWED_ORIGINS` on the backend.

### Guide content source

The repository contains Supabase guide content tables and an import pipeline,
but the current frontend still renders official guide content from bundled
TypeScript files:

- `src/lib/blogContent.ts`
- `src/lib/blogLocalization.ts`
- `src/lib/blogBodyTranslations.ts`

Do not remove these files merely because the Supabase guide tables exist. A
future migration should first add a runtime guide-content query layer and a
tested fallback.

### Translation provider

Forum translation currently uses the same Qianfan-compatible OpenAI client as
the chatbot, with `TRANSLATION_MODEL` optionally overriding `CHAT_MODEL`.
Azure Translator was selected as a possible cheaper dedicated replacement, but
it has not been wired into the current server route.

### Supabase availability

The existing Supabase project was recently paused, which caused
`ERR_NAME_NOT_RESOLVED` and `Failed to fetch` during Auth token refresh. It was
resumed and was not deleted. Free-tier project pausing must be considered in
operations and monitoring.

## 5. Repository Map

```text
server.ts                         Express server and all server API routes
src/App.tsx                       Main view/router orchestration
src/pages/                        Home, auth, forum, chatbot, profile, guides
src/components/                   Navigation, app bar, language/translate UI
src/context/AuthContext.tsx       Supabase Auth and user profile state
src/context/LanguageContext.tsx   Interface language state
src/context/PrivacyConsentContext.tsx Browser consent and optional-category controls
src/lib/                          Supabase, R2, chat, translation, content logic
src/lib/legalContent.ts           Five-language privacy, terms, cookie, and disclaimer copy
src/lib/legalRoutes.ts            Public /privacy, /terms, /cookies, and /disclaimer paths
src/lib/privacyConsent.ts         Consent records and optional-storage cleanup
src/i18n/translations.ts          Interface translations
supabase/                         Database setup and repair SQL
content/                          Guide JSON source and template
schemas/                          JSON Schema for guide content
scripts/                          Import, migration, benchmark, and seed scripts
public/brand/full-logo.png        Header logo
public/favicon.png                Browser favicon
.env.example                      Required environment-variable contract
README.md                         Developer setup and feature notes
```

## 6. Local Setup

### Prerequisites

- Bun
- Node.js
- Access to the required third-party services listed below

### Commands

```bash
git clone <repository-url>
cd CaliGuide
bun install
cp .env.example .env
# Fill in .env with development credentials
bun run dev
```

Local application URL:

```text
http://localhost:3000
```

### Validation commands

```bash
bun test
bun run typecheck
bun run build
```

### Other scripts

```bash
bun run bench:chat
bun run import:guide-content
bun run migrate:r2-avatars
bun run migrate:r2-avatars -- --dry-run
bun run seed:r2-structure
```

## 7. Environment Variables

Never send the actual values by email, chat, or a committed file. Transfer
access through each provider and place secrets in the deployment secret store.

### AI and translation

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `API_KEY` | Server only | Qianfan-compatible chat and translation credential |
| `APP_ID` | Server only | Qianfan application identifier |
| `CHAT_MODEL` | Server only | Optional text chat model override |
| `CHAT_VISION_MODEL` | Server only | Vision model used for chatbot images |
| `TRANSLATION_MODEL` | Server only | Optional forum translation model override |
| `MEM0_API_KEY` | Server only | Optional cross-session CaliBot memory |

### Application and API routing

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `APP_URL` | Server | Public application URL and callback base |
| `VITE_API_BASE_URL` | Browser | Backend origin for split frontend/API hosting |
| `CORS_ALLOWED_ORIGINS` | Server | Comma-separated allowed frontend origins |

### Supabase

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Browser | Publishable/anon browser key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Privileged server operations |

`SUPABASE_SERVICE_ROLE_KEY` must never be used in frontend code or prefixed
with `VITE_`.

### Cloudflare R2

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `CLOUDFLARE_ACCOUNT_ID` | Server only | R2 account identifier |
| `R2_ACCESS_KEY_ID` | Server only | S3-compatible R2 access key |
| `R2_SECRET_ACCESS_KEY` | Server only | S3-compatible R2 secret |
| `R2_BUCKET_NAME` | Server only | Current bucket is `caliguide-media` |
| `R2_PUBLIC_BASE_URL` | Server/browser output | Public media base URL |
| `R2_MOCK_USER_ID` | Script only | Optional structure seed identifier |
| `R2_MOCK_POST_ID` | Script only | Optional structure seed identifier |
| `R2_MOCK_GUIDE_ID` | Script only | Optional structure seed identifier |

### Planned Azure Translator variables

These are not consumed by the current application yet:

```text
AZURE_TRANSLATOR_KEY
AZURE_TRANSLATOR_REGION
AZURE_TRANSLATOR_ENDPOINT
```

## 8. External Service Access To Transfer

Use provider invitations and role-based access. Do not give the next developer
your personal account password.

### GitHub

- Add the developer as a repository collaborator or organization member.
- Confirm whether direct pushes to `main` are allowed.
- Prefer a protected branch and pull requests for future work.

### Supabase

- Invite the developer to the CaliGuide organization/project.
- Developer access is sufficient for normal database work; use Admin only when
  they must change Auth providers, project settings, or credentials.
- Show them the project status page and how to resume a paused project.
- Ensure they can access SQL Editor, Auth settings, logs, and API keys.
- Rotate the service-role key if it has ever been shared insecurely.

### Cloudflare

- Invite the developer to the Cloudflare account with R2 and relevant DNS
  permissions.
- Grant access to the `caliguide-media` bucket.
- Grant DNS/domain access only if they are responsible for deployment.
- Rotate R2 API tokens instead of sharing an existing secret.

### AWS production environment

- Create an individual IAM identity or approved access path.
- Provide the server/instance name, region, SSH or Session Manager procedure,
  deployment directory, runtime supervisor, and log location.
- Document whether production uses systemd, PM2, Docker, or a manual process.
- Store production variables in the server secret mechanism, not Git.

The repository currently does not document the exact AWS deployment commands,
service name, server path, or rollback procedure. The current owner must record
those operational details before the handoff is complete.

### Google Cloud OAuth

- Add the developer to the Google Cloud project.
- Confirm OAuth consent-screen ownership.
- Confirm authorized JavaScript origins and redirect URLs for local and
  production Supabase Auth.
- Do not email the OAuth client secret.

### Qianfan/Baidu AI

- Add the developer to the owning account or create a scoped replacement key.
- Identify the application associated with `APP_ID`.
- Confirm model availability and account billing limits.

### Mem0

- Invite the developer to the workspace if possible, or rotate the API key.
- Explain that the app works without Mem0 but loses cross-session user memory.

### Azure Translator

- Transfer access only if the Azure resource has been created.
- The integration is planned, not currently active in the server.

### Domain ownership

- Identify the registrar for `caliguide.org`.
- Transfer or delegate DNS access.
- Document renewal date, billing owner, and nameservers.

## 9. Supabase Data Model

### Authentication and profile

- `auth.users`: Supabase-managed identities and sessions.
- `profiles`: name, avatar, date of birth, sex, nationalities, location,
  arrival status, and forum translation preference.
- `saved_guides`: guides saved by each user.
- `saved_forum_posts`: forum posts saved by each user.

### Community

- `forum_posts`
- `forum_comments`
- `forum_votes`
- `forum_translations`

Forum posts and comments are readable by signed-in users. Mutation policies
restrict creation, updates, and deletion to the owning user. The translation
cache is server-only.

### Chat

- `chat_sessions`
- `chat_messages`

Chat history is private to the owning user. Mem0 is separate from Supabase and
stores extracted cross-session memory when configured.

### Media metadata

- `media_assets`

The database stores ownership, object key, URL, type, size, association, and
moderation state. Raw files live in Cloudflare R2.

### Guide content

- `content_categories`
- `content_tags`
- `guide_articles`
- `guide_article_translations`
- `guide_article_tags`
- `guide_official_links`
- `guide_media_assets`

These tables and the import script exist, but current page rendering still uses
the bundled TypeScript content described earlier.

## 10. Supabase SQL Files

The current SQL is a collection of setup and repair scripts, not a formal
Supabase migration history. Run scripts in a test project before production.

Important files:

```text
supabase/auth-profile-policies.sql
supabase/account-profile-fields.sql
supabase/community-chat-tables.sql
supabase/grant-community-chat-permissions.sql
supabase/repair-community-chat-tables.sql
supabase/saved-forum-posts.sql
supabase/forum-translations.sql
supabase/guide-content-tables.sql
supabase/reset-guide-content-tables.sql
supabase/r2-avatar-migration-grants.sql
```

Important dependency: `auth-profile-policies.sql` expects base `profiles` and
`saved_guides` tables to already exist. Their original base-table creation is
not represented by a dedicated migration in this repository. Before rebuilding
a new environment, capture the current definitions from Supabase or add an
idempotent base-schema migration.

Recommended rebuild order after the base profile tables exist:

1. `auth-profile-policies.sql`
2. `account-profile-fields.sql`
3. `community-chat-tables.sql`
4. `forum-translations.sql`
5. `guide-content-tables.sql`
6. `r2-avatar-migration-grants.sql`, only for the migration script
7. `bun run import:guide-content`

Use `repair-community-chat-tables.sql` only to repair a partially created or
older schema, not as the first clean-install script.

## 11. Cloudflare R2 Layout

```text
assets/users/{user_id}/profile/{file}
assets/users/{user_id}/forum/{post_id}/{file}
assets/users/{user_id}/chat/{file}
assets/platform/guide/{guide_id}/{file}
assets/platform/public/{file}
```

The application creates `_structure.json` placeholders so user folders remain
visible in the Cloudflare dashboard before every category has real uploads.

Normal forum and chatbot image uploads go to the Express server, which writes
the raw bytes to R2. This same-origin path avoids direct browser-to-R2 CORS
failures. A signed direct-upload fallback also exists, but it requires an R2
CORS policy that allows the app origins and `PUT`/`GET` requests.

## 12. Server API Routes

### Media

```text
POST /api/uploads/sign
POST /api/uploads/avatar
POST /api/uploads/user-structure
POST /api/uploads/file
POST /api/uploads/image
```

### Forum

```text
POST /api/forum/posts
POST /api/forum/comments
POST /api/forum/posts/delete
POST /api/forum/comments/delete
POST /api/forum/votes
POST /api/forum/translate
```

### AI

```text
POST /api/chat
```

Protected routes verify the caller's Supabase access token and use the
server-only service-role client for privileged database operations.

## 13. Major User Flows To Regression Test

### Authentication

- Register with email and complete profile fields.
- Register/login through Google OAuth.
- Log out with confirmation.
- Log back in with correct and incorrect passwords.
- Request and complete password recovery.
- Change profile name, account fields, password, and avatar.
- Open all four legal pages while signed out and switch each supported language.
- Accept, reject, and customize optional browser storage, then reopen Privacy
  Choices from the footer and verify preference revocation removes optional keys.

### Guides

- Switch all supported interface languages.
- Open each home category and recommended guide.
- Verify section, checklist, warning, and official-link parity across languages.
- Search guides and open the See All recommendations page.
- Save and unsave guides from a signed-in account.

### Forum

- Search and filter local mock posts plus Supabase posts.
- Create a post with multiple images and visible upload progress.
- Confirm images display for another account and open in the lightbox.
- Comment, vote useful/unuseful, save, and unsave.
- Confirm users can delete only their own posts/comments.
- Confirm deletion uses a confirmation dialog and persists in Supabase.
- Translate cards, details, and comments to each target language.

### Chatbot

- Create and reopen chat sessions.
- Delete one chat session.
- Stream a text answer and inspect server timing logs.
- Upload multiple images and confirm the vision model receives them.
- Verify Supabase chat persistence.
- With Mem0 configured, verify a user fact is recalled in a new session.

### Infrastructure

- Resume a paused Supabase project and verify Auth reconnects.
- Upload profile, forum, and chat images to the expected R2 paths.
- Verify production `/api/*` routes return JSON rather than static-host 404s.

## 14. Known Risks And Follow-up Work

1. **AWS deployment is under-documented.** Record the exact server, service,
   commands, logs, TLS/proxy configuration, and rollback process.
2. **No formal migration history.** Convert SQL setup scripts into ordered,
   versioned migrations and capture the missing base profile schema.
3. **Supabase free-tier pausing.** Add monitoring or move production to an
   appropriate paid plan before relying on the app for active users.
4. **Two guide data sources.** Decide whether bundled content or Supabase is the
   production source of truth, then implement and test one consistent path.
5. **Azure Translator is not integrated.** The current forum route still uses
   the general AI model. Do not remove the working route until Azure behavior,
   caching, language codes, and failures are tested.
6. **Static deployment failure mode.** Every deployment must include the
   Express API or configure `VITE_API_BASE_URL` correctly.
7. **Secrets rotation.** Rotate any keys previously copied through terminals,
   screenshots, chat, or shared `.env` files.
8. **Content review.** Legal, medical, financial, and immigration guidance
   needs periodic review against current official sources.
9. **Moderation.** Public user content and image uploads need reporting,
   moderation queues, rate limits, file validation, and retention policies
   before broad launch.
10. **Privacy follow-through.** Public privacy, terms, cookie, and disclaimer
    pages now exist in five languages, with a consent banner and permanent
    Privacy Choices control. Remaining launch work includes a retention
    schedule, account deletion/export, AI input warnings, and qualified legal
    review. Configure `privacy@caliguide.org` before publishing the contact path.

## 15. First-Day Checklist For The New Developer

1. Accept GitHub, Supabase, Cloudflare, AWS, Google Cloud, and relevant AI
   provider invitations.
2. Confirm the Supabase project is healthy and record the non-secret project
   URL. Never place the service-role key in browser configuration.
3. Clone the repository and create a personal `.env` from `.env.example`.
4. Run `bun install`, `bun test`, `bun run typecheck`, and `bun run build`.
5. Start `bun run dev` and complete the major smoke tests above.
6. Inspect `git status` and review any uncommitted files before pushing.
7. Document the current AWS deployment procedure while the previous owner is
   still available.
8. Rotate secrets after access transfer is complete.
9. Create an off-site Supabase database backup and an R2 backup plan.
10. Use pull requests for the first production changes.
11. Confirm `privacy@caliguide.org` receives mail and route requests to an owner.
12. Have qualified counsel review the legal drafts before full public launch.

## 16. Information The Current Owner Must Supply Separately

The following details should be provided through a password manager or secure
company documentation, not added to this file:

- GitHub repository URL and ownership contact.
- AWS account ID, region, server name, deployment path, service name, and logs.
- Supabase organization/project name and invited role.
- Cloudflare account and R2 bucket access.
- Domain registrar and renewal information.
- Google Cloud project and OAuth configuration ownership.
- Qianfan application/billing ownership.
- Mem0 workspace ownership.
- Azure Translator resource ownership, if created.
- Production incident contact and expected backup/restore process.

## 17. Handoff Acceptance Criteria

The handoff is complete only when the new developer can independently:

- Clone and validate the project.
- Run it locally with their own authorized credentials.
- Access Supabase logs and SQL Editor.
- Upload and retrieve media from R2.
- Deploy and roll back the production service.
- Diagnose a failing `/api/*` route.
- Rotate all server-only secrets.
- Restore the database and media from documented backups.
