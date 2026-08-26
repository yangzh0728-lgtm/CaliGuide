# Guide Citations Design

## Goal

Add Wikipedia-style numbered citations to every CaliGuide guide section and collect the cited official sources in one References list at the bottom of each guide.

## Scope

- Apply citations to the guide and blog-detail content rendered from `BLOG_ARTICLES`.
- Keep citation evidence identical across English, Simplified Chinese, Traditional Chinese/Cantonese, and Spanish.
- Extend the guide-content JSON schema so future Supabase imports can carry the same section-to-source relationships.
- Do not add citations to forum posts, comments, or chatbot answers in this phase.

## Data Model

Citation metadata lives separately from translated prose. Each article has:

- A list of references with a stable ID, source title, publisher, URL, purpose, and review date.
- One list of reference IDs for every body section.

The body-section arrays must remain the same length in every language, so the same citation mapping applies to every translation.

Future imported JSON uses `citationIds` on each body section and `id`, `publisher`, and `lastReviewedAt` on each official link. The import validator rejects unknown citation IDs.

## Reading Experience

- Citation markers appear after each section as compact links such as `[1]` and `[2]`.
- Selecting a marker scrolls to its numbered entry in the References section.
- Each reference shows its publisher, official title, purpose, review date, and external link.
- Duplicate sources appear once and retain the number assigned by their order in the article reference registry.

## Validation

Automated tests require:

- Every live article to have a citation set.
- Every body section to cite at least one source.
- Every citation ID to resolve to a reference in the same article.
- Reference IDs and URLs to be unique per article.
- Every source URL to use HTTPS.
- Imported guide JSON to reject unknown citation IDs.

## Source Policy

Prefer primary authoritative sources: government agencies, courts, official public programs, and regulators. Sources are reviewed as of August 25, 2026. Content remains general information and readers should confirm current requirements on the cited official page.
