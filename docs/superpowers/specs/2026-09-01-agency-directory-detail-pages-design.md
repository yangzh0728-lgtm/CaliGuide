# Agency Directory and Detail Pages Design

## Status

Approved direction: hybrid directory rows plus dedicated agency detail pages.

## Purpose

CaliGuide's agency directory should help newcomers answer two different questions:

1. The directory answers, "Which agency handles my task, and am I in the right place?"
2. A detail page answers, "What can I do with this agency, and how do I do it safely?"

The current full-card directory makes comparison difficult and routes `/agencies/:id` back to the same card. This design replaces those cards with compact, expandable rows and makes every agency URL a real public detail page.

## Scope

This change covers all 26 institutions already connected to guide citations. High-use agencies receive higher visual priority, but valid cited institutions remain available in the directory, search, sitemap, and detail routes.

The work includes:

- Compact, task-first directory rows
- Expand-in-place orientation information
- Dedicated public detail pages
- Five-language agency content
- Shared agency data used by both surfaces
- Agency-specific metadata and sitemap entries
- Search, filter, empty, loading, and invalid-route states
- Validation for every agency, relationship, translation, reference, and review date

The work does not add user accounts, analytics, a database-backed agency editor, or automatic link checking.

## Information Ownership

The directory and detail page must never contain separately authored versions of the same fact.

The directory row is a strict subset of one institution record. It may show only:

- Acronym and official name
- One-line localized purpose
- Jurisdiction
- Verified official domain
- Localized description of what the agency does not do
- Compact confusion guidance
- Up to two related guides plus the remaining count
- A line-clamped agency-specific warning when one exists
- A link to the full agency page

The detail page owns deeper guidance:

- Common tasks and official action links
- Full confusion-pair explanations
- Language-access information
- Contact channels and office finders
- Preparation guides and what to bring
- Full agency-specific warning
- All related CaliGuide guides
- Last-reviewed information

## Routes and Navigation

- `/agencies` renders the compact directory.
- `/agencies/:institutionId` renders a dedicated agency detail page.
- Clicking the body of a directory row expands or collapses that row without changing the URL.
- The verified-domain link opens the official website in a new tab.
- The full-details link navigates to `/agencies/:institutionId`.
- Browser back returns from an agency page to the directory.
- Unknown agency IDs fall back to the directory with a localized not-found message instead of silently highlighting nothing.
- Every valid agency page remains public and receives canonical metadata and a sitemap entry.

## Directory Organization

The directory is grouped by user need rather than alphabetically:

- Immigration and status
- Identity and transportation
- Money and tax
- Work
- Health
- Housing and consumer protection
- Education
- Emergency and local services

`identity-driving` is renamed to `identity-transportation`. Each group has a localized label in all five supported languages.

On desktop, the directory uses the same organizational pattern as Profile Settings: a persistent left rail labeled "Find by need" and a right results panel. The rail contains All agencies plus every task group, with an agency count beside each label. Selecting a group updates the right panel without navigating away.

On mobile, the left rail becomes a compact horizontally scrollable category selector above the results. The selector must not obscure search or agency rows, and its selected state must remain visible without relying on color alone.

The active task group filters agencies. Search operates within the selected filter. Agencies are ordered by an explicit priority value within each group so the most commonly needed agencies appear first.

One safety notice appears near the top of the directory. It tells users to use verified official domains and warns that government agencies do not demand gift cards or urgent payment. Generic safety copy is not repeated inside every row.

## Institution Data Model

```ts
type Localized<T> = Record<LanguageCode, T>;

interface Institution {
  id: string;
  officialName: string;
  acronym: string;
  publisherNames: string[];
  groupId: InstitutionGroupId;
  jurisdiction: InstitutionJurisdiction;
  priority: number;
  officialUrl: string;
  officialDomain: string;
  lastReviewedAt: string;

  content: Localized<InstitutionContent>;

  taskReferenceIds: string[];
  preparationGuideIds: string[];
  confusionPairs: InstitutionConfusionPair[];
  contactReferenceIds: string[];
  languageAccessReferenceIds: string[];
}

interface InstitutionContent {
  purpose: string;
  doesNotDo: string;
  languageAccessNote: string;
  contactNote?: string;
  scamWarning?: string;
}

interface InstitutionConfusionPair {
  targetInstitutionId: string;
  content: Localized<{
    trigger: string;
    explanation: string;
  }>;
}
```

## Localization Rules

Locale-invariant fields are authored once:

- Stable ID
- Official agency name
- Acronym
- Publisher aliases
- Jurisdiction
- Official domain and URLs
- Reference IDs and guide IDs
- Review dates
- Priority

Localized fields must exist in English, Simplified Chinese, Cantonese, Traditional Chinese, and Spanish:

- Purpose
- What the agency does not do
- Task context supplied by referenced resources
- Confusion triggers and explanations
- Language-access notes
- Contact notes
- Agency-specific warnings

Official agency names remain unchanged in every locale. Supporting explanations translate around them.

Search receives the active language and checks official names, acronyms, domains, publisher aliases, localized purpose and boundary text, localized confusion text, and localized warning text.

## Confusion Pairs

Confusion pairs are most valuable before a user chooses an agency, so they appear on both surfaces from one record.

The expanded row renders a compact orientation statement, such as `Work authorization? -> USCIS`.

The detail page renders the same trigger, target agency link, and full localized explanation. Both views resolve the target by stable institution ID.

## Agency-Specific Warnings

Warnings are optional. They appear only when an agency has a distinctive risk, such as SSA impersonation calls, USCIS lookalike sites, or notario fraud.

Each warning is authored once per language in `content.scamWarning`:

- The row renders the same string with a two-line visual clamp.
- The detail page renders the complete string.

No generic fallback warning is inserted into institution records. The directory-level safety notice covers universal advice.

## Official Resources and Actions

Institution task, contact, office-finder, and language-access links reference stable IDs in the official reference library. URLs, titles, publishers, and review dates are not duplicated in institution records.

The agency detail page groups references by purpose:

- Common tasks
- Contact and office access
- Language access

Action labels use the existing localized action vocabulary where it fits: Apply, Book, Find, Read, Download, and Verify.

Related guides continue to derive from `guideCitations.ts`. The institution record stores only explicit preparation-guide relationships that cannot be inferred from citations.

## Review Dates

`lastReviewedAt` records when the agency identity, jurisdiction, purpose, boundaries, official homepage, confusion guidance, language-access note, and warning were checked against official sources.

Official resources retain their own `lastReviewedAt` dates in the reference library. The detail page shows the institution review date and the resource review date where appropriate.

The phrase "verified official domain" is shown only when the institution record has a valid review date.

## Directory States

### Default

All groups are visible in priority order. Rows are collapsed.

### Expanded

Only the selected row expands. Expanding another row closes the previous row to keep the directory compact.

### Search and filter

Matching rows remain grouped and ordered. Search and task filters may be used together.

### Empty

The localized empty state explains whether no agency matched the search, the task filter, or both. It provides clear-search and clear-filter actions when applicable.

### Invalid agency route

The user is returned to the directory with a localized message that the requested agency could not be found.

## Detail Page Layout

The detail page renders in this order:

1. Breadcrumb back to the agency directory
2. Official name, acronym, jurisdiction, purpose, and official-domain link
3. Prominent "what this agency does not do" boundary
4. Common tasks with official action links
5. Often confused with
6. Language access
7. Contact methods and office finder
8. Preparation and what-to-bring guide links
9. Agency-specific warning, when present
10. All related CaliGuide guides
11. Last-reviewed date

Missing optional sections are omitted rather than filled with placeholder text.

## Metadata and Discoverability

Every `/agencies/:id` route receives:

- A unique English server-rendered title
- A unique description based on the agency purpose and boundaries
- A canonical URL
- Open Graph title, description, and URL
- A sitemap entry

The public search index includes the directory and agency detail pages. Publisher names in guide references link to their agency detail routes.

## Accessibility

- Rows use buttons for expansion and expose `aria-expanded` and `aria-controls`.
- External links and full-detail links remain separate keyboard targets.
- Expansion does not depend on color or pointer input.
- Focus remains predictable when opening or closing a row.
- Empty-state controls have descriptive labels.
- Heading order remains hierarchical on directory and detail pages.

## Verification and Tests

Automated tests must verify:

- Exactly 26 stable institution IDs remain present.
- Every institution has localized content in all five languages.
- Every institution has a valid group, jurisdiction, HTTPS official URL, domain, priority, and review date.
- Every confusion target resolves to another institution.
- Every reference and preparation-guide ID resolves.
- Every citation's institution ID resolves.
- Agency priorities are unique inside each group.
- Search uses the active language.
- Related guides remain citation-derived.
- Rows cap related guides at two and expose the remaining count.
- Warnings come from one localized field and have no row-specific copy.
- `/agencies/:id` renders a real detail page.
- Invalid agency routes show the defined fallback state.
- Agency metadata and sitemap paths remain complete.
- Directory expansion, keyboard behavior, and detail navigation work in browser tests.

Final verification runs the full test suite, typecheck, production build, and visual checks at mobile and desktop widths in production mode.
