# Trust Notices, Guide Actions, and Agency Directory Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add localized chatbot safety disclosures, section-scoped official action links across all 19 guides, and a public agency directory derived from guide citations.

**Architecture:** Keep guide citations as the source of truth. Add stable institution IDs to references, section-level action descriptors to guide citation configs, and a separate institution catalog whose related guides are derived from citation usage. Preserve the Supabase guide-import `officialLinks` contract while removing only the unused legacy `BlogArticle.officialLinks` field.

**Tech Stack:** React 19, TypeScript, Bun tests, Tailwind CSS, existing history-based application routing and i18n dictionaries.

---

### Task 1: Localized chatbot disclosures

**Files:**
- Create: `src/components/ChatSafetyNotice.tsx`
- Create: `src/components/ChatSafetyNotice.test.tsx`
- Modify: `src/pages/Chatbot.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/translations.test.ts`

- [ ] Write a server-render test proving the persistent accuracy notice links to `/disclaimer` and the contextual image warning links to `/privacy` only when images are selected.
- [ ] Run `bun test src/components/ChatSafetyNotice.test.tsx` and confirm it fails because the component does not exist.
- [ ] Implement `ChatSafetyNotice({ hasSelectedImages })` with localized copy and compact accessible styling.
- [ ] Render it directly above the chatbot composer and below selected-image previews.
- [ ] Add all keys to English, Simplified Chinese, Cantonese, Traditional Chinese, and Spanish dictionaries.
- [ ] Run the component and translation tests and confirm they pass.

### Task 2: Section-scoped guide actions

**Files:**
- Modify: `src/lib/guideCitations.ts`
- Modify: `src/lib/guideCitations.test.ts`
- Modify: `src/pages/BlogDetail.tsx`
- Modify: `src/pages/BlogDetail.test.tsx`
- Modify: `src/i18n/translations.ts`

- [ ] Add failing tests for localized action kinds, section-scoped resolution, secure URLs, and action coverage across all 19 guides.
- [ ] Add `GuideActionKind`, `GuideSectionAction`, and `sectionActions` to the citation model.
- [ ] Add the six orphaned official URLs to `GUIDE_REFERENCE_LIBRARY` and assign useful actions without changing citation markers or the References list.
- [ ] Add at least one context-appropriate section action to every guide, using only references cited by that section.
- [ ] Render compact external-link buttons after each section's citation markers.
- [ ] Add localized action labels for `apply`, `book`, `find`, `read`, `download`, and `verify` in all five interface languages.
- [ ] Run citation, BlogDetail, and translation tests.

### Task 3: Remove legacy article official links

**Files:**
- Modify: `src/lib/blogContent.ts`
- Modify: `src/lib/blogLocalization.ts`
- Modify: `src/lib/blogContent.test.ts`
- Modify: `src/lib/blogLocalization.test.ts`
- Modify: `src/i18n/translations.ts`
- Preserve: `src/lib/guideContentImport.ts`

- [ ] Rewrite failing tests so search and source coverage resolve through guide citations rather than `BlogArticle.officialLinks`.
- [ ] Remove the legacy field, its seven data blocks, localization merging, and the unused `blog.officialLinks` UI key.
- [ ] Confirm `GuideContentArticle.officialLinks` and Supabase row generation are unchanged with `guideContentImport.test.ts`.

### Task 4: Institution catalog and derived relationships

**Files:**
- Create: `src/lib/institutions.ts`
- Create: `src/lib/institutions.test.ts`
- Modify: `src/lib/guideCitations.ts`
- Modify: `src/lib/guideCitations.test.ts`

- [ ] Add failing tests requiring every reference to carry a valid stable `institutionId`, every institution to use an official HTTPS domain, and related guides to be derived from citation configs.
- [ ] Define the 26 institutions with group, jurisdiction, purpose, boundary, official domain, and scam note.
- [ ] Add `institutionId` to all 55 reference records and expose a guide-to-institution resolver.
- [ ] Validate all institution coverage and derived guide IDs.

### Task 5: Public agency directory route and UI

**Files:**
- Create: `src/pages/Agencies.tsx`
- Create: `src/pages/Agencies.test.tsx`
- Modify: `src/lib/appRoutes.ts`
- Modify: `src/lib/appRoutes.test.ts`
- Modify: `src/lib/pageMetadata.ts`
- Modify: `src/lib/pageMetadata.test.ts`
- Modify: `src/lib/offlinePolicy.ts`
- Modify: `src/App.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/BlogDetail.tsx`
- Modify: `src/components/LegalFooter.tsx`
- Modify: `src/i18n/translations.ts`

- [ ] Add failing route, metadata, sitemap, offline-cache, rendering, and navigation tests for `/agencies` and `/agencies/:institutionId` anchors.
- [ ] Add the public `agencies` route, metadata, sitemap entry, and offline support.
- [ ] Build a responsive function-grouped directory with search, jurisdiction labels, official domains, scam notes, and derived related-guide links.
- [ ] Make reference publishers link to their agency entry.
- [ ] Link the directory from the Guides area and footer without changing the four-item mobile bottom navigation.
- [ ] Add localized interface labels in all five languages while preserving official agency names.

### Task 6: Verification

- [ ] Run focused tests after each task.
- [ ] Run `bun test` with safe test Supabase environment values.
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run build`.
- [ ] Run `git diff --check` and inspect the final diff for accidental Supabase import changes.
- [ ] Start the production server and visually verify chatbot notices, guide actions, `/agencies`, mobile layout, back navigation, and direct routes.
