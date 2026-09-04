# Balanced Typography Design

## Purpose

CaliGuide currently applies `font-bold` 252 times, compared with 36
`font-semibold` uses, four `font-medium` uses, and no explicit `font-normal`
uses. This makes headings, controls, labels, and explanatory copy compete at
nearly the same visual weight.

This change introduces a calmer, more legible hierarchy across the existing
application. It is a typography-only pass: layout, spacing, color, copy, and
behavior remain unchanged.

## Selected Direction

The approved direction is **Balanced hierarchy**:

- Bold headings retain CaliGuide's confident identity.
- Semibold actions remain easy to identify.
- Medium navigation and labels stay clear without competing with headings.
- Normal-weight reading copy becomes easier to scan for longer periods.

## Weight Rules

### Bold (`font-bold`)

Reserve bold for:

- Page titles and modal titles.
- Section and subsection headings.
- Guide, forum-post, agency, and repeated-item titles.
- Critical warning headings.
- Key numeric values or progress figures when they are the primary information.

### Semibold (`font-semibold`)

Use semibold for:

- Primary and secondary button labels.
- Command links and compact action links.
- User and author names.
- Active selections and selected tabs.
- Important success, error, or status text.

### Medium (`font-medium`)

Use medium for:

- Main and section navigation labels.
- Form labels and field legends.
- Metadata, dates, counts, and jurisdiction labels.
- Topic chips, tags, and compact category labels.
- Secondary controls that are not the page's primary action.

### Normal (`font-normal`)

Use normal weight for:

- Guide and legal-page paragraphs.
- Descriptions, summaries, and excerpts.
- Helper text and explanatory notices.
- Empty-state descriptions.
- Forum and chatbot message content.
- Supporting text inside cards, lists, and dialogs.

Inline bold or semibold emphasis inside normal body copy remains allowed when a
specific phrase needs attention.

## Implementation Method

Review each existing `font-bold` and `font-semibold` class semantically. Do not
perform an unrestricted find-and-replace. Preserve bold where the element is a
true heading or item title, and reclassify the other elements according to the
rules above.

The pass covers `src/App.tsx`, all application pages in `src/pages/`, and shared
interface components in `src/components/`. Existing Tailwind utilities remain
the source of truth; this change does not add a new typography abstraction or
global CSS override.

## Accessibility And Localization

- Weight changes must not reduce text contrast or change text size.
- Buttons and links must remain distinguishable through color, border, shape,
  or placement rather than font weight alone.
- Chinese, Cantonese, Spanish, and English interfaces follow the same semantic
  hierarchy.
- Text wrapping and component dimensions must remain stable at mobile and
  desktop widths.

## Verification

Automated checks will cover representative guide, forum, chatbot, profile,
settings, agency, legal, authentication, and navigation surfaces. The existing
test suite, typecheck, and production build must remain clean.

Browser verification will compare representative public and authenticated
screens at mobile and desktop widths. It will confirm that:

- Body copy is visibly lighter than its heading.
- Actions remain clear and readable.
- Active navigation remains obvious.
- Warning and error hierarchy remains strong.
- No text wrapping, overflow, or layout regression is introduced.

## Out Of Scope

- Container-width or desktop-layout changes.
- Registration-flow changes.
- Search routing or a search-results page.
- Font-family, font-size, line-height, letter-spacing, color, or spacing changes.
- Copy editing or content restructuring.
- Introducing shared typography components or custom utility classes.

## Definition Of Done

- All application surfaces follow the approved four-level weight hierarchy.
- Body and supporting copy no longer use bold without a semantic reason.
- Headings, item titles, actions, labels, and navigation remain visually distinct.
- Existing behavior and layout are unchanged.
- Tests, typecheck, build, whitespace checks, and browser verification pass.
