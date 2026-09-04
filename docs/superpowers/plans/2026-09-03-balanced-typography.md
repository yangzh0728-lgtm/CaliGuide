# Balanced Typography Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the approved bold/semibold/medium/normal hierarchy across CaliGuide without changing layout, spacing, color, copy, or behavior.

**Architecture:** Keep Tailwind utilities directly on the existing elements and reclassify each weight by semantic role. A source-level contract protects broad rules across private surfaces, while Playwright verifies computed weights and layout stability on representative public screens.

**Tech Stack:** React 19, TypeScript, Tailwind CSS 4, Bun test, Playwright

---

## File Map

- Create `src/lib/typographyHierarchy.test.ts`: source contracts for semantic weight usage across page groups.
- Create `e2e/typography.e2e.ts`: computed-style and overflow checks at desktop and mobile sizes.
- Modify `src/App.tsx`: confirmation-dialog action weights.
- Modify shared components in `src/components/`: navigation, dialogs, notices, filters, and compact actions.
- Modify public pages in `src/pages/`: home, guide library, agencies, guide detail, procedural guide, and legal pages.
- Modify community pages in `src/pages/`: forum list, forum detail, and chatbot.
- Modify account pages in `src/pages/`: authentication, profile dashboard, profile panels, and settings.

## Working-Tree Safety

The repository already contains unrelated uncommitted changes in `README.md`,
`src/App.tsx`, `src/components/MovingDeadlineChecklist.tsx`,
`src/pages/Profile.tsx`, and other profile/checklist files. Do not discard or
overwrite them. Before each task, inspect `git diff -- <file>` for any file that
is already dirty. Stage clean files normally; use `git add -p` only for the
typography hunks in pre-dirty files.

---

### Task 1: Shared Chrome, Dialogs, And Utility Components

**Files:**
- Create: `src/lib/typographyHierarchy.test.ts`
- Modify: `src/App.tsx`
- Modify: `src/components/AgencyDirectoryShell.tsx`
- Modify: `src/components/ChatSafetyNotice.tsx`
- Modify: `src/components/ForumReportButton.tsx`
- Modify: `src/components/ForumTranslateButton.tsx`
- Modify: `src/components/LanguageSwitcher.tsx`
- Modify: `src/components/LegalFooter.tsx`
- Modify: `src/components/MovingDeadlineChecklist.tsx`
- Modify: `src/components/PrivacyConsentBanner.tsx`
- Modify: `src/components/PrivacyPreferencesDialog.tsx`
- Modify: `src/components/ProfileSettingsShell.tsx`
- Modify: `src/components/ReferenceLibraryTabs.tsx`
- Modify: `src/components/TopAppBar.tsx`

- [ ] **Step 1: Write the failing shared-component contract**

Create `src/lib/typographyHierarchy.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

function readSources(paths: string[]) {
  return paths.map((path) => readFileSync(path, "utf8")).join("\n");
}

const boldInteractivePattern =
  /<(?:button|a|label|summary)\b[^>]*className=(?:"[^"]*\bfont-bold\b[^"]*"|\{`[^`]*\bfont-bold\b[^`]*`\})[^>]*>/gs;

function expectNoBoldInteractiveText(source: string) {
  expect(source.match(boldInteractivePattern) ?? []).toEqual([]);
}

describe("balanced typography", () => {
  it("uses semibold actions and medium compact labels in shared components", () => {
    const source = readSources([
      "src/App.tsx",
      "src/components/AgencyDirectoryShell.tsx",
      "src/components/ChatSafetyNotice.tsx",
      "src/components/ForumReportButton.tsx",
      "src/components/ForumTranslateButton.tsx",
      "src/components/LanguageSwitcher.tsx",
      "src/components/LegalFooter.tsx",
      "src/components/MovingDeadlineChecklist.tsx",
      "src/components/PrivacyConsentBanner.tsx",
      "src/components/PrivacyPreferencesDialog.tsx",
      "src/components/ProfileSettingsShell.tsx",
      "src/components/ReferenceLibraryTabs.tsx",
      "src/components/TopAppBar.tsx",
    ]);

    expectNoBoldInteractiveText(source);
    expect(source).not.toContain("text-xs font-bold uppercase");
    expect(source).toContain("font-semibold");
    expect(source).toContain("font-medium");
    expect(source).toContain("text-xl font-bold");
  });
});
```

- [ ] **Step 2: Run the contract and verify failure**

Run:

```bash
bun test src/lib/typographyHierarchy.test.ts
```

Expected: FAIL because shared buttons, links, form labels, filter controls, and
compact metadata still contain `font-bold`.

- [ ] **Step 3: Reclassify shared component weights**

Apply this exact manifest. “Active semibold” means the control chooses exactly
one weight: `font-semibold` while active and `font-medium` otherwise. Never
render both utilities on the same element.

```text
src/App.tsx
  delete-dialog heading                                      keep font-bold
  cancel and destructive-confirm buttons                    font-bold -> font-semibold

src/components/PrivacyPreferencesDialog.tsx
  dialog heading                                             keep font-bold
  preference category names                                 font-bold -> font-semibold
  cancel and save buttons                                    font-bold -> font-semibold

src/components/ProfileSettingsShell.tsx
  section navigation                                         font-bold -> medium/semibold by active state
  desktop/mobile back actions                                font-bold -> font-semibold
  page and selected-section headings                         keep font-bold
  SETTINGS eyebrow                                           font-bold -> font-medium

src/components/LanguageSwitcher.tsx
  current short language label                               font-bold -> font-medium
  menu rows                                                  medium/semibold by selected state

src/components/ForumReportButton.tsx
  open, success-close, cancel, and submit controls            font-bold -> font-semibold
  modal heading                                              keep font-bold
  form labels                                                font-bold -> font-medium
  success and error status                                   keep font-semibold

src/components/ReferenceLibraryTabs.tsx
  tabs                                                       medium/semibold by current state

src/components/PrivacyConsentBanner.tsx
  banner heading                                             keep font-bold
  policy link and all three actions                          font-bold -> font-semibold

src/components/TopAppBar.tsx
  page title                                                 keep font-bold
  header action                                              font-bold -> font-semibold

src/components/MovingDeadlineChecklist.tsx
  checklist heading and task titles                          keep font-bold
  reset action                                               font-bold -> font-semibold
  desktop column labels, jurisdiction chips, mobile labels   font-bold -> font-medium
  deadline values                                            keep font-semibold

src/components/ForumTranslateButton.tsx
  translate action                                           font-bold -> font-semibold
  language select                                            font-bold -> font-medium

src/components/ChatSafetyNotice.tsx
  disclaimer and privacy links                               font-bold -> font-semibold

src/components/AgencyDirectoryShell.tsx
  FIND BY NEED eyebrow, jurisdiction, related-guide label    font-bold -> font-medium
  group filters                                              medium/semibold by active state
  section heading and agency name                            keep font-bold
  safety-note lead and does-not-do lead                      font-bold -> font-semibold
  no-results title                                           font-bold -> font-semibold
  clear/show-all, confusion links, guide pills,
  official-domain link, and full-details link                font-bold -> font-semibold
  remaining-guide count                                      font-bold -> font-medium

src/components/LegalFooter.tsx
  footer links                                               font-bold -> font-medium
```

For active controls, use this established class shape:

```tsx
className={`... ${active ? "font-semibold ..." : "font-medium ..."}`}
```

Do not change `Navigation.tsx`; its labels already use `font-medium`. Do not
change `GuideDisclaimer.tsx`; its warning heading is genuine emphasis.

- [ ] **Step 4: Run focused verification**

Run:

```bash
bun test src/lib/typographyHierarchy.test.ts src/components/GuideDisclaimer.test.tsx
bun run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit only typography hunks**

```bash
git add src/lib/typographyHierarchy.test.ts src/components/AgencyDirectoryShell.tsx src/components/ChatSafetyNotice.tsx src/components/ForumReportButton.tsx src/components/ForumTranslateButton.tsx src/components/LanguageSwitcher.tsx src/components/LegalFooter.tsx src/components/PrivacyConsentBanner.tsx src/components/PrivacyPreferencesDialog.tsx src/components/ProfileSettingsShell.tsx src/components/ReferenceLibraryTabs.tsx src/components/TopAppBar.tsx
git add -p src/App.tsx src/components/MovingDeadlineChecklist.tsx
git commit -m "style: balance shared interface typography"
```

---

### Task 2: Public Discovery And Reference Pages

**Files:**
- Modify: `src/lib/typographyHierarchy.test.ts`
- Modify: `src/pages/Agencies.tsx`
- Modify: `src/pages/AgencyDetail.tsx`
- Modify: `src/pages/Home.tsx`
- Modify: `src/pages/RecommendedGuides.tsx`

- [ ] **Step 1: Add the failing public-directory contract**

Append inside the existing `describe` block:

```ts
it("keeps public discovery headings bold while reducing labels and actions", () => {
  const source = readSources([
    "src/pages/Agencies.tsx",
    "src/pages/AgencyDetail.tsx",
    "src/pages/Home.tsx",
    "src/pages/RecommendedGuides.tsx",
  ]);

  expectNoBoldInteractiveText(source);
  expect(source).not.toContain("text-[10px] font-bold uppercase");
  expect(source).not.toContain("text-[11px] font-bold uppercase");
  expect(source).toContain("text-3xl font-bold");
  expect(source).toContain("font-medium");
  expect(source).toContain("font-semibold");
});
```

- [ ] **Step 2: Run and verify failure**

Run `bun test src/lib/typographyHierarchy.test.ts`.

Expected: FAIL on bold links, buttons, filter rows, category labels, and
jurisdiction labels.

- [ ] **Step 3: Reclassify public discovery pages**

```text
src/pages/Home.tsx
  search-result category/type labels and guide-card category font-bold -> font-medium
  search-result, topic, and guide titles                    keep font-bold
  section headings                                          keep font-bold
  See all controls                                          keep font-semibold
  agency-directory action and Read guide action             font-bold -> font-semibold

src/pages/RecommendedGuides.tsx
  page and group headings, guide-card titles                 keep font-bold
  FIND BY TOPIC eyebrow and card category labels             font-bold -> font-medium
  filter rows                                                medium/semibold by active state
  no-results title, clear, and show-all controls             font-bold -> font-semibold

src/pages/Agencies.tsx
  page heading                                               keep font-bold

src/pages/AgencyDetail.tsx
  not-found, agency, boundary, section, and related headings keep font-bold
  jurisdiction label                                        font-bold -> font-medium
  back, official-site, resource, confusion, and guide links  font-bold -> font-semibold
```

Keep excerpts, agency descriptions, purposes, and boundary explanations at
their existing normal weight.

- [ ] **Step 4: Run focused tests**

```bash
bun test src/lib/typographyHierarchy.test.ts src/components/AgencyDirectoryShell.test.tsx src/pages/AgencyDetail.test.tsx src/pages/Home.test.tsx src/pages/RecommendedGuides.test.tsx
bun run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/typographyHierarchy.test.ts src/pages/Agencies.tsx src/pages/AgencyDetail.tsx src/pages/Home.tsx src/pages/RecommendedGuides.tsx
git commit -m "style: clarify public discovery typography"
```

---

### Task 3: Guide And Legal Reading Surfaces

**Files:**
- Modify: `src/lib/typographyHierarchy.test.ts`
- Modify: `src/pages/BlogDetail.tsx`
- Modify: `src/pages/Guide.tsx`
- Modify: `src/pages/LegalPage.tsx`

- [ ] **Step 1: Add the failing reading-surface contract**

Append inside the existing `describe` block:

```ts
it("separates reading copy, metadata, actions, and headings", () => {
  const source = readSources([
    "src/pages/BlogDetail.tsx",
    "src/pages/Guide.tsx",
    "src/pages/LegalPage.tsx",
  ]);

  expectNoBoldInteractiveText(source);
  expect(source).not.toContain("text-xs font-bold text-primary");
  expect(source).toContain("font-medium");
  expect(source).toContain("font-semibold");
  expect(source).toContain("font-bold leading-tight");
});
```

- [ ] **Step 2: Run and verify failure**

Run `bun test src/lib/typographyHierarchy.test.ts`.

Expected: FAIL on guide actions, citation links, legal links, category labels,
and compact metadata.

- [ ] **Step 3: Reclassify guide and legal weights**

```text
src/pages/BlogDetail.tsx
  article category, tags, date/read-time metadata             -> font-medium
  article title, References heading, body section headings    keep font-bold
  save, official action, back-to-section, reference-title     -> font-semibold
  citation number and publisher                               -> font-medium
  institution link                                            keep font-semibold
  checklist/list item text                                    keep font-medium

src/pages/Guide.tsx
  page, section, CTA-section, and FAQ headings                 keep font-bold
  document and process-step titles                             keep font-bold
  fee label and estimated-time chip                            font-bold -> font-medium
  fee value                                                    keep font-semibold
  primary CTA and FAQ summary controls                         font-bold -> font-semibold

src/pages/LegalPage.tsx
  page and section headings                                    keep font-bold
  CaliGuide eyebrow and effective-date metadata                -> font-medium
  back, inline resource, and privacy-contact links              -> font-semibold
```

Do not add a weight to guide, disclaimer, legal, or citation body paragraphs;
their inherited weight remains 400.

- [ ] **Step 4: Run focused tests**

```bash
bun test src/lib/typographyHierarchy.test.ts src/pages/BlogDetail.test.tsx src/lib/legalContent.test.ts
bun run typecheck
```

Expected: PASS.

- [ ] **Step 5: Commit clean files and stage only the BlogDetail typography hunk**

```bash
git add src/lib/typographyHierarchy.test.ts src/pages/BlogDetail.tsx src/pages/Guide.tsx src/pages/LegalPage.tsx
git commit -m "style: improve guide reading hierarchy"
```

`src/pages/BlogDetail.tsx` is currently clean; do not stage the pre-existing
changes in `src/pages/BlogDetail.test.tsx`.

---

### Task 4: Forum And Chat Surfaces

**Files:**
- Modify: `src/lib/typographyHierarchy.test.ts`
- Modify: `src/pages/Chatbot.tsx`
- Modify: `src/pages/Forum.tsx`
- Modify: `src/pages/ForumDetail.tsx`

- [ ] **Step 1: Add the failing community contract**

Append inside the existing `describe` block:

```ts
it("keeps community content readable and actions distinct", () => {
  const source = readSources([
    "src/pages/Chatbot.tsx",
    "src/pages/Forum.tsx",
    "src/pages/ForumDetail.tsx",
  ]);

  expectNoBoldInteractiveText(source);
  expect(source).not.toContain("text-xs font-bold uppercase");
  expect(source).not.toContain("text-[10px] font-bold uppercase");
  expect(source).toContain("font-medium");
  expect(source).toContain("font-semibold");
});
```

- [ ] **Step 2: Run and verify failure**

Run `bun test src/lib/typographyHierarchy.test.ts`.

Expected: FAIL on forum actions and labels, chatbot controls, author names, and
category metadata.

- [ ] **Step 3: Reclassify chatbot typography**

```text
src/pages/Chatbot.tsx
  CaliBot heading                                             keep font-bold
  status/topic badge, attachment filename, upload label,
  Photos label, attachment count                             font-bold -> font-medium
  new-chat, image fallback, suggestion, and upload actions    font-bold -> font-semibold
  existing warning/error/status text                         keep font-semibold
  message content and privacy-warning copy                   keep inherited normal weight
```

- [ ] **Step 4: Reclassify forum typography**

```text
src/pages/Forum.tsx
  page, featured-post, section, card, empty-state,
  and compose-modal headings                                 keep font-bold
  avatar initials and reply count                            keep font-bold
  author names                                               font-bold -> font-semibold
  categories, goal label, section eyebrows, reply label,
  form labels, image filenames, and upload status            -> font-medium
  join/read, starter-guide, upload, submit, image fallback,
  and vote controls                                          font-bold -> font-semibold
  upload guidance and attachment helper rows                 font-semibold -> font-normal
  topic select value                                         font-semibold -> font-normal
  error states                                               keep font-semibold

src/pages/ForumDetail.tsx
  page, image-section, and comments headings                 keep font-bold
  avatar initials                                            keep font-bold
  author names                                               font-bold -> font-semibold
  categories, tags, image counts, timestamps, metadata,
  and form labels                                            -> font-medium
  image fallback, vote, submit, and reply-vote controls       font-bold -> font-semibold
  error state                                                keep font-semibold
```

- [ ] **Step 5: Run focused tests**

```bash
bun test src/lib/typographyHierarchy.test.ts src/components/ForumReportButton.test.tsx
bun run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/typographyHierarchy.test.ts src/pages/Chatbot.tsx src/pages/Forum.tsx src/pages/ForumDetail.tsx
git commit -m "style: balance community typography"
```

---

### Task 5: Authentication, Profile, And Settings

**Files:**
- Modify: `src/lib/typographyHierarchy.test.ts`
- Modify: `src/pages/AuthPage.tsx`
- Modify: `src/pages/Profile.tsx`

- [ ] **Step 1: Add the failing account-surface contract**

Append inside the existing `describe` block:

```ts
it("uses medium labels, semibold actions, and bold account headings", () => {
  const source = readSources([
    "src/pages/AuthPage.tsx",
    "src/pages/Profile.tsx",
  ]);

  expectNoBoldInteractiveText(source);
  expect(source).not.toContain("text-xs font-bold text-on-surface-variant uppercase");
  expect(source).not.toContain("text-xs font-bold uppercase text-on-surface-variant");
  expect(source).toContain("font-normal");
  expect(source).toContain("font-medium");
  expect(source).toContain("font-semibold");
  expect(source).toContain("text-3xl font-bold");
});
```

- [ ] **Step 2: Run and verify failure**

Run `bun test src/lib/typographyHierarchy.test.ts`.

Expected: FAIL because form labels, account actions, tabs, profile controls, and
supporting account copy remain bold.

- [ ] **Step 3: Reclassify authentication typography**

```text
src/pages/AuthPage.tsx
  page heading                                               keep font-bold
  login/register tabs                                        medium/semibold by active state
  sign-up-method instruction                                 font-semibold -> font-normal
  email and Google option titles                             font-bold -> font-semibold
  registration-method notice                                font-bold -> font-normal
  all field labels                                           font-bold -> font-medium
  back, add-nationality, Google, submit, forgot-password,
  and continue-browsing actions                              font-bold -> font-semibold
  error and success messages                                 keep font-semibold
```

- [ ] **Step 4: Reclassify profile typography without disturbing current work**

```text
src/pages/Profile.tsx
  avatar initials, page/panel/modal/section headings,
  guide/post titles, checklist item titles, user name,
  dashboard headings, and arrival-card title                keep font-bold
  every field label, setting eyebrow, consent definition,
  arrival-status eyebrow, tags, categories, and metadata     font-bold -> font-medium
  upload, add-nationality, save, password, privacy, export,
  delete, modal, dashboard, view, browse, sign-out, back,
  empty-state, vote, and other command controls              font-bold -> font-semibold
  privacy definition terms                                   font-bold -> font-semibold
  recent-chat rows                                           keep font-semibold
  status and error messages                                  keep or change to font-semibold
  explanatory descriptions                                  keep inherited normal weight
```

Do not alter profile data flow, checklist persistence, arrival-state logic,
translations, or panel layout. Review the pre-existing diff before and after the
weight-only edit.

- [ ] **Step 5: Run focused tests**

```bash
bun test src/lib/typographyHierarchy.test.ts src/pages/AuthPage.test.tsx src/components/ProfileSettingsShell.test.tsx
bun run typecheck
```

Expected: PASS.

- [ ] **Step 6: Commit AuthPage and stage only Profile typography hunks**

```bash
git add src/lib/typographyHierarchy.test.ts src/pages/AuthPage.tsx
git add -p src/pages/Profile.tsx
git commit -m "style: refine account typography"
```

---

### Task 6: Global Contract And Browser Verification

**Files:**
- Modify: `src/lib/typographyHierarchy.test.ts`
- Create: `e2e/typography.e2e.ts`

- [ ] **Step 1: Add the failing global distribution contract**

Append inside the existing `describe` block:

```ts
it("maintains the selected weight distribution across the interface", () => {
  const paths = [
    "src/App.tsx",
    ...[
      "AgencyDirectoryShell", "ChatSafetyNotice", "ForumReportButton",
      "ForumTranslateButton", "GuideDisclaimer", "LanguageSwitcher",
      "LegalFooter", "MovingDeadlineChecklist", "Navigation",
      "PrivacyConsentBanner", "PrivacyPreferencesDialog",
      "ProfileSettingsShell", "ReferenceLibraryTabs", "TopAppBar",
    ].map((name) => `src/components/${name}.tsx`),
    ...[
      "Agencies", "AgencyDetail", "AuthPage", "BlogDetail", "Chatbot",
      "Forum", "ForumDetail", "Guide", "Home", "LegalPage", "Profile",
      "RecommendedGuides",
    ].map((name) => `src/pages/${name}.tsx`),
  ];
  const source = readSources(paths);
  const count = (weight: string) => source.match(new RegExp(`font-${weight}`, "g"))?.length ?? 0;

  expect(count("bold")).toBeLessThan(140);
  expect(count("semibold")).toBeGreaterThanOrEqual(60);
  expect(count("medium")).toBeGreaterThanOrEqual(30);
});
```

- [ ] **Step 2: Run the global contract**

Run `bun test src/lib/typographyHierarchy.test.ts`.

Expected: PASS only after all preceding page groups follow the approved
hierarchy. If a threshold fails, inspect remaining classes by semantic role;
do not change a true heading merely to satisfy a count.

- [ ] **Step 3: Write the browser-level typography checks**

Create `e2e/typography.e2e.ts`:

```ts
import { expect, test, type Locator } from "@playwright/test";

async function expectWeight(locator: Locator, expected: string) {
  await expect(locator).toBeVisible();
  expect(await locator.evaluate((element) => getComputedStyle(element).fontWeight)).toBe(expected);
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

test("uses balanced hierarchy on a public guide", async ({ page }) => {
  await page.goto("/guides/california-driver-license-application");

  await expectWeight(page.getByRole("heading", { level: 1 }), "700");
  await expectWeight(page.getByRole("button", { name: "Sign in to save this guide" }), "600");
  await expectWeight(page.locator("header > div").first().locator("span").first(), "500");
  await expectWeight(page.locator('[id^="guide-section-"] p').first(), "400");
  await expectNoHorizontalOverflow(page);
});

test("uses balanced hierarchy on authentication", async ({ page }) => {
  await page.goto("/profile");

  await expectWeight(page.getByRole("heading", { level: 1, name: "Welcome back" }), "700");
  await expectWeight(page.getByRole("button", { name: "Login", exact: true }), "600");
  await expectWeight(page.getByText("Sign in to continue managing your guides, profile, and saved resources."), "400");
  await expectWeight(page.getByText("Email", { exact: true }), "500");
  await expectNoHorizontalOverflow(page);
});
```

The existing Playwright configuration runs each test in desktop Chromium and
mobile Chromium, so these two cases cover both viewport classes.

- [ ] **Step 4: Run browser verification**

```bash
bunx playwright test e2e/typography.e2e.ts
```

Expected: four passing cases: two tests in desktop Chromium and the same two in
mobile Chromium. Body copy computes to 400, labels to 500, actions to 600, and
headings to 700 with no horizontal overflow.

- [ ] **Step 5: Run full verification**

```bash
bun test
bun run typecheck
bun run build
bunx playwright test
git diff --check
```

Expected: all unit tests and both Playwright projects pass, typecheck exits 0,
the production build succeeds, and `git diff --check` prints nothing.

- [ ] **Step 6: Review the final weight inventory**

```bash
printf 'bold '; rg -o 'font-bold' src --glob '*.{tsx,ts,css}' | wc -l
printf 'semibold '; rg -o 'font-semibold' src --glob '*.{tsx,ts,css}' | wc -l
printf 'medium '; rg -o 'font-medium' src --glob '*.{tsx,ts,css}' | wc -l
```

Expected: fewer than 140 bold utilities, at least 60 semibold utilities, and at
least 30 medium utilities. Treat these as regression bounds, not design goals.

- [ ] **Step 7: Commit final tests**

```bash
git add src/lib/typographyHierarchy.test.ts e2e/typography.e2e.ts
git commit -m "test: protect balanced typography hierarchy"
```

Do not include `README.md`, profile/checklist data work, `.superpowers/`, or any
other pre-existing uncommitted file in these commits.
