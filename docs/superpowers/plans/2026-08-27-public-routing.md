# Public Guide Routing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every guide a stable URL, make guide reading public, preserve private-action authentication, and expose crawler-friendly guide metadata.

**Architecture:** Add a dependency-free typed route registry that maps stable guide slugs and application pages to paths. `App` becomes URL-driven while retaining its existing in-memory forum state, and Express injects metadata into the SPA shell for public guide requests.

**Tech Stack:** React 19, TypeScript, browser History API, Express, Vite, Bun tests.

---

### Task 1: Typed route registry

**Files:**
- Create: `src/lib/appRoutes.ts`
- Create: `src/lib/appRoutes.test.ts`

- [ ] **Step 1: Write failing route tests**

Cover `/`, `/guides`, all explicit guide slugs, `/forum/:id`, `/chatbot`, `/profile`, unknown paths, path generation, and public-route classification.

- [ ] **Step 2: Verify the route tests fail**

Run: `bun test src/lib/appRoutes.test.ts`

Expected: failure because `appRoutes.ts` does not exist.

- [ ] **Step 3: Implement the route registry**

Define an `AppRoute` discriminated union, a stable article-id/slug map, `getAppRouteFromPath`, `getAppRoutePath`, `getGuideSlug`, and `isPublicAppRoute`. Validate that every `BLOG_ARTICLES` id has exactly one slug.

- [ ] **Step 4: Verify route tests pass**

Run: `bun test src/lib/appRoutes.test.ts`

Expected: all route tests pass.

### Task 2: URL-driven application state and public guide reading

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/components/Navigation.tsx`
- Modify: `src/components/TopAppBar.tsx`
- Modify: `src/pages/BlogDetail.tsx`
- Modify: `src/pages/AuthPage.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/translations.test.ts`

- [ ] **Step 1: Add failing tests for public-action labels**

Add translation coverage for sign in, continue browsing, and sign-in-required save behavior in all supported languages.

- [ ] **Step 2: Verify the new translation test fails**

Run: `bun test src/i18n/translations.test.ts`

Expected: missing new translation keys.

- [ ] **Step 3: Drive `App` from `AppRoute`**

Initialize from `window.location.pathname`, handle `popstate`, navigate through `pushState`, map routes to existing page components, keep public routes visible while signed out, and gate private routes/actions with `AuthPage` without replacing the requested URL.

- [ ] **Step 4: Add public sign-in and continue-browsing controls**

Let signed-out visitors open authentication from the public shell and return to a public guide without losing the URL. The guide save button must request authentication instead of calling Supabase without a user.

- [ ] **Step 5: Verify focused and existing tests**

Run: `bun test src/lib/appRoutes.test.ts src/i18n/translations.test.ts src/pages/BlogDetail.test.tsx`

Expected: all focused tests pass.

### Task 3: Guide metadata, crawler HTML, and sitemap

**Files:**
- Create: `src/lib/pageMetadata.ts`
- Create: `src/lib/pageMetadata.test.ts`
- Modify: `src/App.tsx`
- Modify: `server.ts`

- [ ] **Step 1: Write failing metadata tests**

Test guide title, description, canonical path, Open Graph type, HTML-safe injection values, sitemap coverage, and exclusion of private routes.

- [ ] **Step 2: Verify metadata tests fail**

Run: `bun test src/lib/pageMetadata.test.ts`

Expected: failure because metadata helpers do not exist.

- [ ] **Step 3: Implement shared metadata helpers**

Build route metadata from the English guide source, escape injected values, and generate a sitemap URL list from public routes.

- [ ] **Step 4: Wire client and Express metadata**

Update document metadata on client route changes. In production, read `dist/index.html`, inject route-specific tags for public pages, and serve `robots.txt` plus `sitemap.xml` using `PUBLIC_SITE_URL` with `https://www.caliguide.org` as the documented default.

- [ ] **Step 5: Verify metadata and server build**

Run: `bun test src/lib/pageMetadata.test.ts`

Expected: all metadata tests pass.

### Task 4: Full verification

**Files:**
- Modify only files required by verification findings.

- [ ] **Step 1: Run the complete unit suite**

Run: `bun test`

Expected: all tests pass.

- [ ] **Step 2: Run typecheck**

Run: `bun run typecheck`

Expected: no TypeScript errors.

- [ ] **Step 3: Run the production build**

Run: `bun run build`

Expected: Vite and the Express bundle succeed.

- [ ] **Step 4: Audit the diff**

Run: `git diff --check`

Expected: no whitespace errors.

- [ ] **Step 5: Browser verification**

Verify a direct `/guides/:slug` load signed out, save-to-auth gating, sign-in return behavior, unknown-guide fallback, and browser back/forward navigation at desktop and mobile widths.
