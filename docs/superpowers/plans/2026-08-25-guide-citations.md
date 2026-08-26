# Guide Citations Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add verified, Wikipedia-style `[1]` citations to every live CaliGuide guide section and a consolidated References list to every guide detail page.

**Architecture:** Store article references and section citation IDs in a dedicated registry independent of translated prose. Resolve stable IDs into display numbers in a small citation helper, render markers and the reference list in the guide detail page, and extend the import schema/validator for future Supabase content.

**Tech Stack:** React 19, TypeScript, Bun test, Tailwind CSS, JSON Schema, Supabase guide import tooling.

---

### Task 1: Citation registry and validation

**Files:**
- Create: `src/lib/guideCitations.ts`
- Create: `src/lib/guideCitations.test.ts`

- [ ] Write tests requiring citations for every article and body section.
- [ ] Run `bun test src/lib/guideCitations.test.ts` and confirm the missing module fails.
- [ ] Add the typed citation registry and resolver helpers.
- [ ] Re-run the focused tests and confirm they pass.

### Task 2: Guide-detail citation UI

**Files:**
- Modify: `src/pages/BlogDetail.tsx`
- Modify: `src/i18n/translations.ts`

- [ ] Add localized labels for References, official source, reviewed date, and source purpose.
- [ ] Render compact `[n]` markers after every body section.
- [ ] Replace the legacy official-links cards with one numbered References list.
- [ ] Add anchor navigation from marker to reference and back to the cited section.

### Task 3: Import contract

**Files:**
- Modify: `schemas/guide-content.schema.json`
- Modify: `src/lib/guideContentImport.ts`
- Modify: `src/lib/guideContentImport.test.ts`
- Modify: `content/guide-content.template.json`

- [ ] Write a failing import test for an unknown body citation ID.
- [ ] Extend the schema and import types with reference IDs and `citationIds`.
- [ ] Validate that every citation ID exists in its article's official links.
- [ ] Update the example template to demonstrate the citation contract.

### Task 4: Verification

- [ ] Run `bun test`.
- [ ] Run `bun run typecheck`.
- [ ] Run `bun run build`.
- [ ] Inspect a guide in English and Chinese at desktop and mobile widths.
