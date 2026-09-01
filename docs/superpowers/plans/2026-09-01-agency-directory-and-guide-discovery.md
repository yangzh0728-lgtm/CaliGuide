# Agency Directory and Guide Discovery Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the agency card wall with a Settings-style task directory and real detail pages, then make the guide library directly discoverable from navigation and Home.

**Architecture:** Institution facts live in one typed catalog and helper layer. `/agencies` renders a responsive task-navigation shell with compact expandable rows, while `/agencies/:id` renders a separate detail component from the same record. Guide discovery uses the existing `/guides` route and article metadata; topic categories are derived from content instead of hardcoded format labels.

**Tech Stack:** React 19, TypeScript, Tailwind CSS, Bun test, React server rendering tests, Vite, Playwright.

---

### Task 1: Institution data and directory helpers

**Files:**
- Modify: `src/lib/institutionCatalog.ts`
- Modify: `src/lib/institutions.ts`
- Test: `src/lib/institutions.test.ts`

- [ ] **Step 1: Write failing tests**

Add assertions for `priority`, `lastReviewedAt`, five locale entries, localized search, renamed `identity-transportation`, valid confusion targets, no generic warnings, and `getRelatedGuideIds(id).slice(0, 2)` behavior through a dedicated row-summary helper.

- [ ] **Step 2: Run the focused test and confirm the expected failures**

Run: `bun test src/lib/institutions.test.ts`

Expected: failures for fields and helpers that do not exist yet.

- [ ] **Step 3: Implement the typed model and helpers**

Create locale-invariant fields and localized content access:

```ts
export interface InstitutionContent {
  purpose: string;
  doesNotDo: string;
  languageAccessNote: string;
  scamWarning?: string;
}

export interface Institution {
  id: string;
  officialName: string;
  acronym: string;
  groupId: InstitutionGroupId;
  priority: number;
  lastReviewedAt: string;
  content: Record<LanguageCode, InstitutionContent>;
  confusionPairs: InstitutionConfusionPair[];
  // existing official and citation relationship fields remain
}
```

Add `getLocalizedInstitution`, `searchInstitutions(query, language)`, `getInstitutionRowSummary`, and priority-sorted grouping. Keep all 26 institution IDs.

- [ ] **Step 4: Run the focused test until green**

Run: `bun test src/lib/institutions.test.ts`

- [ ] **Step 5: Commit the data layer**

```bash
git add src/lib/institutionCatalog.ts src/lib/institutions.ts src/lib/institutions.test.ts
git commit -m "feat: organize localized agency data"
```

### Task 2: Settings-style agency directory

**Files:**
- Create: `src/components/AgencyDirectoryShell.tsx`
- Create: `src/components/AgencyDirectoryShell.test.tsx`
- Modify: `src/pages/Agencies.tsx`
- Modify: `src/pages/Agencies.test.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/translations.test.ts`

- [ ] **Step 1: Write failing component tests**

Assert that the shell renders a desktop task rail, mobile task selector, one safety notice, compact agency rows, `aria-expanded`, a two-guide cap with `+N`, localized empty-state actions, and no repeated generic safety notes.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `bun test src/components/AgencyDirectoryShell.test.tsx src/pages/Agencies.test.tsx src/i18n/translations.test.ts`

- [ ] **Step 3: Implement the shell and row behavior**

Use a responsive structure matching `ProfileSettingsShell`:

```tsx
<div className="md:grid md:grid-cols-[240px_minmax(0,1fr)] md:gap-6">
  <aside className="hidden md:block">{desktopTaskNavigation}</aside>
  <section>{mobileTaskSelector}{search}{agencyRows}</section>
</div>
```

Allow one expanded row at a time. Keep official-domain and full-detail links as distinct controls. Show compact confusion guidance and line-clamped specific warning only when present.

- [ ] **Step 4: Add all new interface strings in five languages**

Add task labels, filter counts, clear-search/filter labels, directory safety copy, expand/collapse labels, guide-count text, full-details text, and invalid-agency text.

- [ ] **Step 5: Run focused tests until green**

Run: `bun test src/components/AgencyDirectoryShell.test.tsx src/pages/Agencies.test.tsx src/i18n/translations.test.ts`

- [ ] **Step 6: Commit the directory UI**

```bash
git add src/components/AgencyDirectoryShell.tsx src/components/AgencyDirectoryShell.test.tsx src/pages/Agencies.tsx src/pages/Agencies.test.tsx src/i18n/translations.ts src/i18n/translations.test.ts
git commit -m "feat: replace agency cards with task directory"
```

### Task 3: Real agency detail pages

**Files:**
- Create: `src/pages/AgencyDetail.tsx`
- Create: `src/pages/AgencyDetail.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/lib/appRoutes.ts`
- Modify: `src/lib/appRoutes.test.ts`
- Modify: `src/lib/pageMetadata.ts`
- Modify: `src/lib/pageMetadata.test.ts`

- [ ] **Step 1: Write failing route, markup, and metadata tests**

Assert that `/agencies/ca-dmv` resolves to a detail route, renders a boundary section, tasks/resources, confusion pairs, language access, related guides, and review date, and receives unique canonical metadata. Assert an invalid ID produces the directory fallback message.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `bun test src/pages/AgencyDetail.test.tsx src/lib/appRoutes.test.ts src/lib/pageMetadata.test.ts`

- [ ] **Step 3: Implement the detail route and component**

Render `AgencyDetail` when the agencies route includes a valid institution ID. Keep the directory and detail components separate. Resolve links and guides from shared reference/citation data rather than duplicating URLs.

- [ ] **Step 4: Run focused tests until green**

Run: `bun test src/pages/AgencyDetail.test.tsx src/lib/appRoutes.test.ts src/lib/pageMetadata.test.ts`

- [ ] **Step 5: Commit detail pages**

```bash
git add src/pages/AgencyDetail.tsx src/pages/AgencyDetail.test.tsx src/App.tsx src/lib/appRoutes.ts src/lib/appRoutes.test.ts src/lib/pageMetadata.ts src/lib/pageMetadata.test.ts
git commit -m "feat: add agency detail pages"
```

### Task 4: Guide navigation and Home discovery

**Files:**
- Modify: `src/components/Navigation.tsx`
- Create: `src/components/Navigation.test.tsx`
- Modify: `src/pages/Home.tsx`
- Create: `src/pages/Home.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/translations.test.ts`

- [ ] **Step 1: Write failing navigation and Home tests**

Assert five navigation entries in order: Home, Guides, Forum, Chatbot, Profile. Assert Home exposes the true topic categories with article counts, omits `Community Guide` and `Forum Question` from topic navigation, provides a visible agency-directory feature link, and contains no fabricated reply/time values.

- [ ] **Step 2: Run focused tests and confirm failure**

Run: `bun test src/components/Navigation.test.tsx src/pages/Home.test.tsx src/i18n/translations.test.ts`

- [ ] **Step 3: Add the Guides navigation entry**

Map the Guides tab to the existing `recommended` page and treat guide/detail pages as active descendants where appropriate.

- [ ] **Step 4: Replace hardcoded Home categories with derived topic summaries**

Use localized articles to produce topic counts. Render a responsive grid that remains compact on mobile and uses desktop width. Exclude format-only labels from topic navigation without migrating the article schema in this task.

- [ ] **Step 5: Fix recommended and trending presentation**

Use scroll snap and intentional partial-card affordance on mobile, whole-card grid presentation on desktop, promote the agency directory outside the legal footer, and remove fabricated reply/time metadata from editorial question cards.

- [ ] **Step 6: Run focused tests until green**

Run: `bun test src/components/Navigation.test.tsx src/pages/Home.test.tsx src/i18n/translations.test.ts`

- [ ] **Step 7: Commit discoverability changes**

```bash
git add src/components/Navigation.tsx src/components/Navigation.test.tsx src/pages/Home.tsx src/pages/Home.test.tsx src/App.tsx src/i18n/translations.ts src/i18n/translations.test.ts
git commit -m "feat: make guides directly discoverable"
```

### Task 5: Full verification and browser QA

**Files:**
- Modify only files required by verified failures.

- [ ] **Step 1: Run full automated verification**

```bash
bun test
bun run typecheck
bun run build
git diff --check
```

- [ ] **Step 2: Run production-mode browser checks**

Verify `/agencies`, `/agencies/ca-dmv`, `/guides`, and `/` at 390x844 and 1440x1000. Confirm no overlap, full keyboard access, route/back behavior, compact rows, desktop task rail, mobile selector, five-item navigation, and whole-card desktop recommendations.

- [ ] **Step 3: Commit only necessary verification fixes**

```bash
git add src
git commit -m "fix: polish agency and guide discovery flows"
```

- [ ] **Step 4: Push the completed commits**

Run: `git push origin main`
