# Guide Content Reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let any guide reader submit a structured correction report to a private Supabase review queue without requiring an account.

**Architecture:** A localized modal in `BlogDetail` sends a validated payload to one rate-limited Express endpoint. The endpoint optionally verifies a Supabase bearer token, derives trusted guide metadata from the code-owned guide and citation libraries, and inserts through the service-role client into a table that has no browser-role grants or RLS policies.

**Tech Stack:** React 19, TypeScript, Express, Supabase PostgreSQL/RLS, Tailwind CSS, Bun test, Lucide React

---

## File Map

- Create `src/components/GuideReportButton.tsx`: localized report command and modal.
- Create `src/components/GuideReportButton.test.tsx`: server-rendered form and accessibility coverage.
- Create `src/lib/guideReportServer.ts`: server-trusted guide lookup, section bounds, and insert construction.
- Create `src/lib/guideReportServer.test.ts`: trusted metadata and insert validation tests.
- Create `src/lib/guideReportRoute.ts`: optional-auth submission orchestration with sanitized outcomes.
- Create `src/lib/guideReportRoute.test.ts`: anonymous, authenticated, and database-failure route coverage.
- Create `src/lib/contentReportsSql.test.ts`: SQL permission and constraint contract.
- Create `supabase/content-reports.sql`: private report queue schema.
- Modify `src/lib/guideFeedback.ts`: structured input and optional-auth client request.
- Modify `src/lib/guideFeedback.test.ts`: validation and anonymous/authenticated request coverage.
- Modify `server.ts`: rate-limited report insertion route.
- Modify `src/pages/BlogDetail.tsx`: render the report command after References.
- Modify `src/pages/BlogDetail.test.tsx`: verify every guide exposes reporting in the correct location.
- Modify `src/i18n/translations.ts`: five-language interface copy.
- Modify `src/i18n/translations.test.ts`: translation parity coverage.
- Modify `src/lib/accountDataServer.ts`: export and delete signed-in reporter rows.
- Modify `src/lib/accountDataServer.test.ts`: explicit table inventory assertions.
- Modify `src/lib/legalContent.ts`: disclose guide correction reports.
- Modify `docs/DATA_INVENTORY.md`: document stored fields and private processing path.
- Create `e2e/guide-report.e2e.ts`: browser-level success and retry-state coverage.

---

### Task 1: Trusted Guide Report Model

**Files:**
- Modify: `src/lib/guideFeedback.ts`
- Modify: `src/lib/guideFeedback.test.ts`
- Create: `src/lib/guideReportServer.ts`
- Create: `src/lib/guideReportServer.test.ts`

- [ ] **Step 1: Write failing validation and trusted-context tests**

Extend `src/lib/guideFeedback.test.ts`:

```ts
it("accepts a structured anonymous guide report", () => {
  expect(validateGuideIssueInput({
    articleId: "guide-1",
    sectionIndex: 2,
    language: "zh-CN",
    reason: "translation",
    details: "The translated document name is incorrect.",
  })).toEqual({
    ok: true,
    value: {
      articleId: "guide-1",
      sectionIndex: 2,
      language: "zh-CN",
      reason: "translation",
      details: "The translated document name is incorrect.",
    },
  });
});

it("rejects invalid sections, languages, reasons, and oversized details", () => {
  expect(validateGuideIssueInput({ articleId: "guide-1", sectionIndex: -1, language: "en", reason: "outdated" }).ok).toBe(false);
  expect(validateGuideIssueInput({ articleId: "guide-1", sectionIndex: null, language: "fr", reason: "outdated" }).ok).toBe(false);
  expect(validateGuideIssueInput({ articleId: "guide-1", sectionIndex: null, language: "en", reason: "other" }).ok).toBe(false);
  expect(validateGuideIssueInput({ articleId: "guide-1", sectionIndex: null, language: "en", reason: "confusing", details: "x".repeat(1501) }).ok).toBe(false);
});
```

Replace the existing `"validates structured correction reports"` test with:

```ts
it("validates structured correction reports", () => {
  expect(validateGuideIssueInput({
    articleId: "guide-1",
    sectionIndex: null,
    language: "en",
    reason: "outdated",
    details: "The fee appears to have changed.",
  })).toEqual({
    ok: true,
    value: {
      articleId: "guide-1",
      sectionIndex: null,
      language: "en",
      reason: "outdated",
      details: "The fee appears to have changed.",
    },
  });

  expect(validateGuideIssueInput({
    articleId: "../secret",
    sectionIndex: null,
    language: "en",
    reason: "confusing",
  })).toEqual({ ok: false, error: "Guide id is invalid" });
});
```

Create `src/lib/guideReportServer.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { buildContentReportInsert } from "./guideReportServer";

describe("guide report server model", () => {
  it("derives the review date and reporter id from trusted server context", () => {
    const result = buildContentReportInsert({
      articleId: "guide-1",
      sectionIndex: 0,
      language: "en",
      reason: "broken_link",
      details: "The application link returns an error.",
    }, "11111111-1111-4111-8111-111111111111");

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.value.article_reviewed_at).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.value.reporter_user_id).toBe("11111111-1111-4111-8111-111111111111");
      expect(result.value.status).toBe("open");
    }
  });

  it("rejects unknown articles and out-of-range sections", () => {
    expect(buildContentReportInsert({ articleId: "missing", sectionIndex: null, language: "en", reason: "outdated", details: "" }, null).ok).toBe(false);
    expect(buildContentReportInsert({ articleId: "guide-1", sectionIndex: 999, language: "en", reason: "outdated", details: "" }, null).ok).toBe(false);
  });
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run:

```bash
bun test src/lib/guideFeedback.test.ts src/lib/guideReportServer.test.ts
```

Expected: FAIL because the expanded payload and `guideReportServer.ts` do not exist.

- [ ] **Step 3: Expand the shared report input**

Replace the types and validator in `src/lib/guideFeedback.ts` with:

```ts
import type { LanguageCode } from "../i18n/translations";

export const GUIDE_ISSUE_REASONS = [
  "outdated",
  "incorrect",
  "broken_link",
  "translation",
  "confusing",
] as const;

export type GuideIssueReason = (typeof GUIDE_ISSUE_REASONS)[number];

export interface GuideIssueInput {
  articleId: string;
  sectionIndex: number | null;
  language: LanguageCode;
  reason: GuideIssueReason;
  details?: string;
}

const GUIDE_REPORT_LANGUAGES = ["en", "zh-CN", "zh-TW", "yue", "es"] as const;

export function validateGuideIssueInput(input: unknown):
  | { ok: true; value: Required<GuideIssueInput> }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") return { ok: false, error: "Guide report is required" };
  const value = input as Record<string, unknown>;
  const articleId = typeof value.articleId === "string" ? value.articleId.trim() : "";
  const details = typeof value.details === "string" ? value.details.trim() : "";
  const sectionIndex = value.sectionIndex === null ? null : value.sectionIndex;

  if (!/^[a-z0-9][a-z0-9-]{0,99}$/i.test(articleId)) return { ok: false, error: "Guide id is invalid" };
  if (sectionIndex !== null && (typeof sectionIndex !== "number" || !Number.isInteger(sectionIndex) || sectionIndex < 0)) return { ok: false, error: "Guide section is invalid" };
  if (typeof value.language !== "string" || !GUIDE_REPORT_LANGUAGES.includes(value.language as LanguageCode)) return { ok: false, error: "Guide language is invalid" };
  if (typeof value.reason !== "string" || !GUIDE_ISSUE_REASONS.includes(value.reason as GuideIssueReason)) return { ok: false, error: "Choose a valid report reason" };
  if (details.length > 1500) return { ok: false, error: "Report details must be 1,500 characters or fewer" };

  return { ok: true, value: {
    articleId,
    sectionIndex: sectionIndex as number | null,
    language: value.language as LanguageCode,
    reason: value.reason as GuideIssueReason,
    details,
  } };
}
```

In the pre-existing successful API-submission test, replace its report input with:

```ts
{
  articleId: "guide-1",
  sectionIndex: null,
  language: "en",
  reason: "broken_link",
  details: "Reference 2 is unavailable.",
}
```

Keep its assertions for `POST /api/guides/reports` and `Authorization: Bearer token`.

- [ ] **Step 4: Build the server-trusted insert helper**

Create `src/lib/guideReportServer.ts`:

```ts
import { BLOG_ARTICLES } from "./blogContent";
import { getGuideCitationSet } from "./guideCitations";
import { validateGuideIssueInput } from "./guideFeedback";

export function buildContentReportInsert(input: unknown, reporterUserId: string | null) {
  const validation = validateGuideIssueInput(input);
  if (!validation.ok) return validation;

  const article = BLOG_ARTICLES.find(({ id }) => id === validation.value.articleId);
  if (!article) return { ok: false as const, error: "Guide is unavailable" };
  if (validation.value.sectionIndex !== null && validation.value.sectionIndex >= article.body.length) {
    return { ok: false as const, error: "Guide section is invalid" };
  }

  const citationSet = getGuideCitationSet(article.id);
  const articleReviewedAt = citationSet?.references
    .map(({ lastReviewedAt }) => lastReviewedAt)
    .sort()
    .at(-1);
  if (!articleReviewedAt) return { ok: false as const, error: "Guide review metadata is unavailable" };

  return {
    ok: true as const,
    value: {
      article_id: article.id,
      section_index: validation.value.sectionIndex,
      language: validation.value.language,
      article_reviewed_at: articleReviewedAt,
      reason: validation.value.reason,
      details: validation.value.details,
      reporter_user_id: reporterUserId,
      status: "open" as const,
    },
  };
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
bun test src/lib/guideFeedback.test.ts src/lib/guideReportServer.test.ts
```

Expected: PASS.

Commit:

```bash
git add src/lib/guideFeedback.ts src/lib/guideFeedback.test.ts src/lib/guideReportServer.ts src/lib/guideReportServer.test.ts
git commit -m "feat: validate guide correction reports"
```

---

### Task 2: Private Supabase Review Queue

**Files:**
- Create: `supabase/content-reports.sql`
- Create: `src/lib/contentReportsSql.test.ts`
- Modify: `src/lib/accountDataServer.ts`
- Modify: `src/lib/accountDataServer.test.ts`

- [ ] **Step 1: Write the failing SQL contract test**

Create `src/lib/contentReportsSql.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";

const sql = readFileSync(new URL("../../supabase/content-reports.sql", import.meta.url), "utf8");

describe("content reports SQL", () => {
  it("creates a private constrained review queue", () => {
    expect(sql).toContain("create table if not exists public.content_reports");
    expect(sql).toContain("alter table public.content_reports enable row level security");
    expect(sql).toContain("revoke all on table public.content_reports from anon, authenticated");
    expect(sql).toContain("grant select, insert, update, delete on table public.content_reports to service_role");
    expect(sql).not.toMatch(/create policy[\s\S]+content_reports/i);
    expect(sql).toContain("char_length(details) <= 1500");
    expect(sql).toContain("'translation'");
    expect(sql).toContain("'confusing'");
  });
});
```

- [ ] **Step 2: Run the SQL test and verify failure**

Run `bun test src/lib/contentReportsSql.test.ts`.

Expected: FAIL because `supabase/content-reports.sql` is missing.

- [ ] **Step 3: Create the private queue schema script**

Create `supabase/content-reports.sql`:

```sql
create extension if not exists pgcrypto;

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  article_id text not null check (article_id ~ '^[A-Za-z0-9][A-Za-z0-9-]{0,99}$'),
  section_index integer check (section_index is null or section_index >= 0),
  language text not null check (language in ('en', 'zh-CN', 'zh-TW', 'yue', 'es')),
  article_reviewed_at date not null,
  reason text not null check (reason in ('outdated', 'incorrect', 'broken_link', 'translation', 'confusing')),
  details text not null default '' check (char_length(details) <= 1500),
  reporter_user_id uuid references auth.users(id) on delete set null,
  status text not null default 'open' check (status in ('open', 'reviewing', 'resolved', 'dismissed')),
  review_notes text,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists content_reports_queue_idx
  on public.content_reports(status, created_at desc);
create index if not exists content_reports_article_idx
  on public.content_reports(article_id, created_at desc);

create or replace function public.set_content_report_updated_at()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists content_reports_updated_at on public.content_reports;
create trigger content_reports_updated_at
before update on public.content_reports
for each row execute function public.set_content_report_updated_at();

alter table public.content_reports enable row level security;
revoke all on table public.content_reports from anon, authenticated;
grant select, insert, update, delete on table public.content_reports to service_role;
```

- [ ] **Step 4: Add signed-in reports to account export and deletion**

Add `{ table: "content_reports", ownerColumn: "reporter_user_id" }` to `ACCOUNT_EXPORT_TABLES`. Put `content_reports` before `forum_reports` in `ACCOUNT_DELETE_TABLES` so deletion removes associated data before deleting the auth identity.

The resulting arrays must be:

```ts
export const ACCOUNT_EXPORT_TABLES = [
  { table: "profiles", ownerColumn: "id" },
  { table: "saved_guides", ownerColumn: "user_id" },
  { table: "saved_forum_posts", ownerColumn: "user_id" },
  { table: "moving_checklist_progress", ownerColumn: "user_id" },
  { table: "forum_posts", ownerColumn: "user_id" },
  { table: "forum_comments", ownerColumn: "user_id" },
  { table: "forum_votes", ownerColumn: "user_id" },
  { table: "chat_sessions", ownerColumn: "user_id" },
  { table: "chat_messages", ownerColumn: "user_id" },
  { table: "media_assets", ownerColumn: "owner_user_id" },
  { table: "content_reports", ownerColumn: "reporter_user_id" },
  { table: "forum_reports", ownerColumn: "reporter_user_id" },
] as const;

export const ACCOUNT_DELETE_TABLES = [
  { table: "content_reports", ownerColumn: "reporter_user_id" },
  { table: "forum_reports", ownerColumn: "reporter_user_id" },
  { table: "forum_votes", ownerColumn: "user_id" },
  { table: "saved_forum_posts", ownerColumn: "user_id" },
  { table: "saved_guides", ownerColumn: "user_id" },
  { table: "moving_checklist_progress", ownerColumn: "user_id" },
  { table: "forum_comments", ownerColumn: "user_id" },
  { table: "forum_posts", ownerColumn: "user_id" },
  { table: "chat_messages", ownerColumn: "user_id" },
  { table: "chat_sessions", ownerColumn: "user_id" },
  { table: "media_assets", ownerColumn: "owner_user_id" },
  { table: "profiles", ownerColumn: "id" },
] as const;
```

Replace the two existing inventory expectations in `src/lib/accountDataServer.test.ts` with:

```ts
expect(ACCOUNT_EXPORT_TABLES).toEqual([
  { table: "profiles", ownerColumn: "id" },
  { table: "saved_guides", ownerColumn: "user_id" },
  { table: "saved_forum_posts", ownerColumn: "user_id" },
  { table: "moving_checklist_progress", ownerColumn: "user_id" },
  { table: "forum_posts", ownerColumn: "user_id" },
  { table: "forum_comments", ownerColumn: "user_id" },
  { table: "forum_votes", ownerColumn: "user_id" },
  { table: "chat_sessions", ownerColumn: "user_id" },
  { table: "chat_messages", ownerColumn: "user_id" },
  { table: "media_assets", ownerColumn: "owner_user_id" },
  { table: "content_reports", ownerColumn: "reporter_user_id" },
  { table: "forum_reports", ownerColumn: "reporter_user_id" },
]);

expect(ACCOUNT_DELETE_TABLES.map(({ table }) => table)).toEqual([
  "content_reports",
  "forum_reports",
  "forum_votes",
  "saved_forum_posts",
  "saved_guides",
  "moving_checklist_progress",
  "forum_comments",
  "forum_posts",
  "chat_messages",
  "chat_sessions",
  "media_assets",
  "profiles",
]);
```

Then add:

```ts
it("includes signed-in guide reports in account controls", () => {
  expect(ACCOUNT_EXPORT_TABLES.map(({ table }) => table)).toContain("content_reports");
  expect(ACCOUNT_DELETE_TABLES.map(({ table }) => table)).toContain("content_reports");
});
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
bun test src/lib/contentReportsSql.test.ts src/lib/accountDataServer.test.ts
```

Expected: PASS.

Commit:

```bash
git add supabase/content-reports.sql src/lib/contentReportsSql.test.ts src/lib/accountDataServer.ts src/lib/accountDataServer.test.ts
git commit -m "feat: add private guide report queue"
```

---

### Task 3: Anonymous And Authenticated Client Submission

**Files:**
- Modify: `src/lib/guideFeedback.ts`
- Modify: `src/lib/guideFeedback.test.ts`

- [ ] **Step 1: Write failing optional-auth request tests**

Add two tests using the existing fetch capture:

```ts
it("submits anonymously without an authorization header", async () => {
  globalThis.fetch = (async (_url, init) => {
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  await reportGuideIssueViaApi({ auth: { getSession: async () => ({ data: { session: null }, error: null }) } }, {
    articleId: "guide-1", sectionIndex: null, language: "en", reason: "outdated", details: "",
  });
});

it("includes a verified session token when available", async () => {
  globalThis.fetch = (async (_url, init) => {
    expect((init?.headers as Record<string, string>).Authorization).toBe("Bearer token");
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  await reportGuideIssueViaApi({ auth: { getSession: async () => ({ data: { session: { access_token: "token" } }, error: null }) } }, {
    articleId: "guide-1", sectionIndex: 0, language: "es", reason: "confusing", details: "No entiendo este paso.",
  });
});

it("falls back to anonymous submission when session lookup fails", async () => {
  globalThis.fetch = (async (_url, init) => {
    expect((init?.headers as Record<string, string>).Authorization).toBeUndefined();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }) as typeof fetch;

  await reportGuideIssueViaApi({ auth: { getSession: async () => ({
    data: { session: null },
    error: { message: "Session unavailable" },
  }) } }, {
    articleId: "guide-1", sectionIndex: null, language: "en", reason: "outdated", details: "",
  });
});
```

- [ ] **Step 2: Run and verify the anonymous test fails**

Run `bun test src/lib/guideFeedback.test.ts`.

Expected: FAIL with `Sign in required`.

- [ ] **Step 3: Make the session token optional**

Build headers without sending an empty credential:

```ts
const { data } = await client.auth.getSession();

const headers: Record<string, string> = { "Content-Type": "application/json" };
if (data.session?.access_token) {
  headers.Authorization = `Bearer ${data.session.access_token}`;
}

const response = await fetch(resolveApiUrl("/api/guides/reports"), {
  method: "POST",
  headers,
  body: JSON.stringify(validation.value),
});
```

Keep response parsing and generic failure handling. Do not add a direct-Supabase fallback because browser roles intentionally cannot access this table.

- [ ] **Step 4: Run tests and commit**

Run `bun test src/lib/guideFeedback.test.ts`.

Expected: PASS.

Commit:

```bash
git add src/lib/guideFeedback.ts src/lib/guideFeedback.test.ts
git commit -m "feat: allow anonymous guide reports"
```

---

### Task 4: Rate-Limited Server Endpoint

**Files:**
- Create: `src/lib/guideReportRoute.ts`
- Create: `src/lib/guideReportRoute.test.ts`
- Modify: `server.ts`
- Modify: `src/lib/guideReportServer.test.ts`

- [ ] **Step 1: Add optional-auth and endpoint-outcome coverage**

Extend `src/lib/guideReportServer.test.ts` to assert `buildContentReportInsert(input, null)` returns `reporter_user_id: null`. This proves the insert model supports anonymous readers independently of Express.

```ts
it("builds an anonymous insert when no verified user is present", () => {
  const result = buildContentReportInsert({
    articleId: "guide-1",
    sectionIndex: null,
    language: "en",
    reason: "outdated",
    details: "",
  }, null);

  expect(result.ok).toBe(true);
  if (result.ok) expect(result.value.reporter_user_id).toBeNull();
});
```

Create `src/lib/guideReportRoute.test.ts`:

```ts
import { describe, expect, it } from "bun:test";
import { readFileSync } from "node:fs";
import { handleGuideReportSubmission } from "./guideReportRoute";

const validInput = {
  articleId: "guide-1",
  sectionIndex: 0,
  language: "en",
  reason: "outdated",
  details: "The office instructions may have changed.",
};

describe("guide report route", () => {
  it("accepts anonymous reports without invoking authentication", async () => {
    let authCalls = 0;
    const result = await handleGuideReportSubmission(validInput, undefined, {
      verifyUserId: async () => { authCalls += 1; return null; },
      insert: async (row) => {
        expect(row.reporter_user_id).toBeNull();
        return true;
      },
    });

    expect(authCalls).toBe(0);
    expect(result).toEqual({ status: 200, body: { ok: true } });
  });

  it("associates a valid signed-in reporter", async () => {
    const result = await handleGuideReportSubmission(validInput, "Bearer valid", {
      verifyUserId: async () => "11111111-1111-4111-8111-111111111111",
      insert: async (row) => {
        expect(row.reporter_user_id).toBe("11111111-1111-4111-8111-111111111111");
        return true;
      },
    });

    expect(result.status).toBe(200);
  });

  it("rejects an invalid supplied credential", async () => {
    const result = await handleGuideReportSubmission(validInput, "Bearer expired", {
      verifyUserId: async () => null,
      insert: async () => { throw new Error("insert must not run"); },
    });

    expect(result).toEqual({ status: 401, body: { error: "Sign in required" } });
  });

  it("does not expose database failures", async () => {
    const result = await handleGuideReportSubmission(validInput, undefined, {
      verifyUserId: async () => null,
      insert: async () => false,
    });

    expect(result).toEqual({
      status: 500,
      body: { error: "Unable to submit guide feedback right now" },
    });
    expect(JSON.stringify(result)).not.toContain("database");
  });

  it("attaches the strict per-route limiter in Express", () => {
    const serverSource = readFileSync(new URL("../../server.ts", import.meta.url), "utf8");
    expect(serverSource).toMatch(
      /app\.post\(\s*["']\/api\/guides\/reports["'][\s\S]*?createApiRateLimiter\(\{ max: 6, windowMs: 60 \* 60 \* 1000 \}\)/,
    );
  });
});
```

- [ ] **Step 2: Run and verify the route tests fail**

Run:

```bash
bun test src/lib/guideReportServer.test.ts src/lib/guideReportRoute.test.ts
```

Expected: FAIL because the route orchestration module and Express route do not exist.

- [ ] **Step 3: Implement sanitized route orchestration**

Create `src/lib/guideReportRoute.ts`:

```ts
import { buildContentReportInsert } from "./guideReportServer";

type ContentReportInsert = Extract<
  ReturnType<typeof buildContentReportInsert>,
  { ok: true }
>["value"];

interface GuideReportDependencies {
  verifyUserId: (authorization: string) => Promise<string | null>;
  insert: (value: ContentReportInsert) => Promise<boolean>;
}

export async function handleGuideReportSubmission(
  input: unknown,
  authorization: string | undefined,
  dependencies: GuideReportDependencies,
) {
  let reporterUserId: string | null = null;
  if (authorization) {
    reporterUserId = await dependencies.verifyUserId(authorization);
    if (!reporterUserId) {
      return { status: 401 as const, body: { error: "Sign in required" } };
    }
  }

  const report = buildContentReportInsert(input, reporterUserId);
  if (!report.ok) {
    return { status: 400 as const, body: { error: report.error } };
  }

  if (!await dependencies.insert(report.value)) {
    return {
      status: 500 as const,
      body: { error: "Unable to submit guide feedback right now" },
    };
  }

  return { status: 200 as const, body: { ok: true as const } };
}
```

- [ ] **Step 4: Add the report route import**

In `server.ts` import:

```ts
import { handleGuideReportSubmission } from "./src/lib/guideReportRoute";
```

- [ ] **Step 5: Add the endpoint**

Place this route beside `/api/forum/reports`:

```ts
app.post(
  "/api/guides/reports",
  createApiRateLimiter({ max: 6, windowMs: 60 * 60 * 1000 }),
  async (req, res) => {
    if (!supabaseAdmin) {
      return res.status(503).json({ error: "Guide reporting is temporarily unavailable" });
    }

    const result = await handleGuideReportSubmission(
      req.body,
      getHeaderString(req.headers.authorization),
      {
        verifyUserId: async (authorization) => {
          const authResult = await getRequestUser(authorization, supabaseAdmin);
          return "error" in authResult ? null : authResult.user.id;
        },
        insert: async (value) => {
          const { error } = await supabaseAdmin.from("content_reports").insert(value);
          if (error) console.warn("Guide report insert failed", { code: error.code });
          return !error;
        },
      },
    );

    return res.status(result.status).json(result.body);
  },
);
```

Do not log `req.body`, report details, article language, or reporter identifiers.

- [ ] **Step 6: Run server-focused checks and commit**

Run:

```bash
bun test src/lib/guideReportServer.test.ts src/lib/guideReportRoute.test.ts src/lib/serverRateLimit.test.ts
bun run typecheck
```

Expected: PASS.

Commit:

```bash
git add server.ts src/lib/guideReportServer.test.ts src/lib/guideReportRoute.ts src/lib/guideReportRoute.test.ts
git commit -m "feat: accept rate-limited guide reports"
```

---

### Task 5: Five-Language Report Modal

**Files:**
- Create: `src/components/GuideReportButton.tsx`
- Create: `src/components/GuideReportButton.test.tsx`
- Modify: `src/i18n/translations.ts`
- Modify: `src/i18n/translations.test.ts`

- [ ] **Step 1: Write failing component and translation tests**

Create `src/components/GuideReportButton.test.tsx`:

```tsx
import { describe, expect, it } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { LanguageProvider } from "../context/LanguageContext";
import { PrivacyConsentProvider } from "../context/PrivacyConsentContext";
import { getBlogArticle } from "../lib/blogContent";
import { GuideReportButton } from "./GuideReportButton";

function renderReportButton(defaultOpen = false) {
  const article = getBlogArticle("guide-1")!;
  const html = renderToStaticMarkup(
    <PrivacyConsentProvider>
      <LanguageProvider>
        <GuideReportButton article={article} defaultOpen={defaultOpen} />
      </LanguageProvider>
    </PrivacyConsentProvider>,
  );
  return { article, html };
}

describe("GuideReportButton", () => {
  it("offers a compact correction command for every guide", () => {
    const { html } = renderReportButton();
    expect(html).toContain("Report incorrect information");
  });

  it("renders the complete accessible report form", () => {
    const { article, html } = renderReportButton(true);

    expect(html).toContain('role="dialog"');
    expect(html).toContain('aria-modal="true"');
    expect(html).toContain("Report a guide problem");
    expect(html).toContain("Outdated information");
    expect(html).toContain("Factually incorrect");
    expect(html).toContain("Broken official link");
    expect(html).toContain("Translation error");
    expect(html).toContain("Confusing or unclear");
    expect(html).toContain("Whole guide");
    expect(html).toContain('maxLength="1500"');

    for (const body of article.body) {
      const heading = formatBlogBodyBlock(body).heading;
      if (heading) expect(html).toContain(heading);
    }
  });
});
```

Add this import beside the existing component-test imports:

```ts
import { formatBlogBodyBlock } from "../lib/blogBodyFormat";
```

In `src/i18n/translations.test.ts`, add:

```ts
it("translates guide correction reporting in every supported language", () => {
  const keys = [
    "guideReport.open", "guideReport.title", "guideReport.copy", "guideReport.reason",
    "guideReport.section", "guideReport.wholeGuide", "guideReport.details",
    "guideReport.detailsPlaceholder", "guideReport.cancel", "guideReport.submit",
    "guideReport.submitting", "guideReport.success", "guideReport.error",
    "guideReport.reason.outdated", "guideReport.reason.incorrect",
    "guideReport.reason.broken_link", "guideReport.reason.translation",
    "guideReport.reason.confusing",
  ];

  for (const language of LANGUAGES.map(({ code }) => code)) {
    for (const key of keys) {
      expect(translate(language, key)).toBeTruthy();
      expect(translate(language, key)).not.toBe(key);
      if (language !== "en") {
        expect(translate(language, key)).not.toBe(translate("en", key));
      }
    }
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run:

```bash
bun test src/components/GuideReportButton.test.tsx src/i18n/translations.test.ts
```

Expected: FAIL because the component and translation keys are missing.

- [ ] **Step 3: Add all localized strings**

Add this exact record near the other late translation extensions, then merge each record into its language table:

```ts
const guideReportCopy = {
  en: {
    "guideReport.open": "Report incorrect information", "guideReport.title": "Report a guide problem",
    "guideReport.copy": "Tell us what needs review. Do not include private documents or account numbers.", "guideReport.reason": "Reason",
    "guideReport.section": "Guide section", "guideReport.wholeGuide": "Whole guide", "guideReport.details": "What happened when you tried this?",
    "guideReport.detailsPlaceholder": "Describe what appears outdated, wrong, broken, or unclear.", "guideReport.cancel": "Cancel",
    "guideReport.submit": "Submit report", "guideReport.submitting": "Submitting...", "guideReport.success": "Thank you. Your report was added to the review queue.",
    "guideReport.error": "We could not submit this report. Please try again.", "guideReport.reason.outdated": "Outdated information",
    "guideReport.reason.incorrect": "Factually incorrect", "guideReport.reason.broken_link": "Broken official link",
    "guideReport.reason.translation": "Translation error", "guideReport.reason.confusing": "Confusing or unclear",
  },
  "zh-CN": {
    "guideReport.open": "报告错误信息", "guideReport.title": "报告指南问题", "guideReport.copy": "请告诉我们哪些内容需要审核。请勿填写私人文件或账号。",
    "guideReport.reason": "原因", "guideReport.section": "指南章节", "guideReport.wholeGuide": "整篇指南", "guideReport.details": "您尝试办理时发生了什么？",
    "guideReport.detailsPlaceholder": "请说明哪些内容可能过时、错误、链接失效或表达不清。", "guideReport.cancel": "取消", "guideReport.submit": "提交报告",
    "guideReport.submitting": "正在提交...", "guideReport.success": "谢谢。您的报告已加入审核队列。", "guideReport.error": "暂时无法提交报告，请重试。",
    "guideReport.reason.outdated": "信息已过时", "guideReport.reason.incorrect": "事实错误", "guideReport.reason.broken_link": "官方链接失效",
    "guideReport.reason.translation": "翻译错误", "guideReport.reason.confusing": "难以理解或不清楚",
  },
  "zh-TW": {
    "guideReport.open": "回報錯誤資訊", "guideReport.title": "回報指南問題", "guideReport.copy": "請告訴我們哪些內容需要審查。請勿填寫私人文件或帳號。",
    "guideReport.reason": "原因", "guideReport.section": "指南章節", "guideReport.wholeGuide": "整篇指南", "guideReport.details": "您嘗試辦理時發生了什麼？",
    "guideReport.detailsPlaceholder": "請說明哪些內容可能過時、錯誤、連結失效或表達不清。", "guideReport.cancel": "取消", "guideReport.submit": "提交回報",
    "guideReport.submitting": "正在提交...", "guideReport.success": "謝謝。您的回報已加入審查佇列。", "guideReport.error": "暫時無法提交回報，請再試一次。",
    "guideReport.reason.outdated": "資訊已過時", "guideReport.reason.incorrect": "事實錯誤", "guideReport.reason.broken_link": "官方連結失效",
    "guideReport.reason.translation": "翻譯錯誤", "guideReport.reason.confusing": "難以理解或不清楚",
  },
  yue: {
    "guideReport.open": "報告錯誤資料", "guideReport.title": "報告指南問題", "guideReport.copy": "請話畀我哋知邊啲內容需要覆核。請唔好填寫私人文件或帳戶號碼。",
    "guideReport.reason": "原因", "guideReport.section": "指南章節", "guideReport.wholeGuide": "成篇指南", "guideReport.details": "你嘗試辦理嗰陣發生咗咩？",
    "guideReport.detailsPlaceholder": "請講明邊啲內容可能過時、錯誤、連結失效或者唔清楚。", "guideReport.cancel": "取消", "guideReport.submit": "提交報告",
    "guideReport.submitting": "提交緊...", "guideReport.success": "多謝。你嘅報告已經加入覆核隊列。", "guideReport.error": "暫時提交唔到報告，請再試。",
    "guideReport.reason.outdated": "資料已過時", "guideReport.reason.incorrect": "事實錯誤", "guideReport.reason.broken_link": "官方連結失效",
    "guideReport.reason.translation": "翻譯錯誤", "guideReport.reason.confusing": "難明或唔清楚",
  },
  es: {
    "guideReport.open": "Reportar información incorrecta", "guideReport.title": "Reportar un problema en la guía",
    "guideReport.copy": "Cuéntanos qué debemos revisar. No incluyas documentos privados ni números de cuenta.", "guideReport.reason": "Motivo",
    "guideReport.section": "Sección de la guía", "guideReport.wholeGuide": "Guía completa", "guideReport.details": "¿Qué ocurrió cuando intentaste hacerlo?",
    "guideReport.detailsPlaceholder": "Describe qué parece desactualizado, incorrecto, roto o poco claro.", "guideReport.cancel": "Cancelar",
    "guideReport.submit": "Enviar reporte", "guideReport.submitting": "Enviando...", "guideReport.success": "Gracias. Tu reporte se agregó a la cola de revisión.",
    "guideReport.error": "No pudimos enviar el reporte. Inténtalo de nuevo.", "guideReport.reason.outdated": "Información desactualizada",
    "guideReport.reason.incorrect": "Información incorrecta", "guideReport.reason.broken_link": "Enlace oficial roto",
    "guideReport.reason.translation": "Error de traducción", "guideReport.reason.confusing": "Confuso o poco claro",
  },
} satisfies Record<LanguageCode, Record<string, string>>;

for (const language of LANGUAGES.map(({ code }) => code)) {
  Object.assign(translations[language], guideReportCopy[language]);
}
```

- [ ] **Step 4: Implement the modal component**

Create `GuideReportButton.tsx`:

```tsx
import { useState, type FormEvent } from "react";
import { CheckCircle2, Flag, LoaderCircle, X } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { formatBlogBodyBlock } from "../lib/blogBodyFormat";
import type { BlogArticle } from "../lib/blogContent";
import { GUIDE_ISSUE_REASONS, reportGuideIssueViaApi, type GuideIssueReason } from "../lib/guideFeedback";
import { supabase } from "../lib/supabaseClient";

export function GuideReportButton({ article, defaultOpen = false }: { article: BlogArticle; defaultOpen?: boolean }) {
  const { language, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [reason, setReason] = useState<GuideIssueReason>("outdated");
  const [sectionIndex, setSectionIndex] = useState<number | null>(null);
  const [details, setDetails] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const sections = article.body.map((body, index) => ({ index, heading: formatBlogBodyBlock(body).heading || `${t("guideReport.section")} ${index + 1}` }));

  const close = () => {
    if (status === "submitting") return;
    setIsOpen(false); setReason("outdated"); setSectionIndex(null); setDetails(""); setStatus("idle");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus("submitting");
    try {
      await reportGuideIssueViaApi(supabase, { articleId: article.id, sectionIndex, language, reason, details });
      setStatus("success");
    } catch (error) {
      console.warn("Guide report failed", error instanceof Error ? error.message : "unknown error");
      setStatus("error");
    }
  };

  return <>
    <button type="button" onClick={() => setIsOpen(true)} className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-bold text-primary hover:bg-primary/5">
      <Flag size={16} /> {t("guideReport.open")}
    </button>
    {isOpen ? <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 p-4 sm:items-center" role="presentation" onClick={close}>
      <section role="dialog" aria-modal="true" aria-labelledby="guide-report-title" className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-outline-variant bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div><h2 id="guide-report-title" className="text-xl font-bold text-on-surface">{t("guideReport.title")}</h2><p className="mt-1 text-sm leading-6 text-on-surface-variant">{t("guideReport.copy")}</p></div>
          <button type="button" aria-label={t("guideReport.cancel")} onClick={close} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high"><X size={18} /></button>
        </div>
        {status === "success" ? <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-green-900" role="status"><div className="flex gap-3"><CheckCircle2 className="shrink-0" size={20} /><p className="text-sm font-semibold leading-6">{t("guideReport.success")}</p></div><button type="button" onClick={close} className="mt-4 h-10 w-full rounded-xl bg-primary text-sm font-bold text-white">{t("guideReport.cancel")}</button></div> :
          <form onSubmit={submit} className="mt-5 space-y-4">
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase text-primary">{t("guideReport.reason")}</span><select value={reason} disabled={status === "submitting"} onChange={(event) => setReason(event.target.value as GuideIssueReason)} className="h-12 w-full rounded-xl border border-outline-variant bg-white px-3">{GUIDE_ISSUE_REASONS.map((item) => <option key={item} value={item}>{t(`guideReport.reason.${item}`)}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase text-primary">{t("guideReport.section")}</span><select value={sectionIndex ?? ""} disabled={status === "submitting"} onChange={(event) => setSectionIndex(event.target.value === "" ? null : Number(event.target.value))} className="h-12 w-full rounded-xl border border-outline-variant bg-white px-3"><option value="">{t("guideReport.wholeGuide")}</option>{sections.map((section) => <option key={section.index} value={section.index}>{section.index + 1}. {section.heading}</option>)}</select></label>
            <label className="block"><span className="mb-2 block text-xs font-bold uppercase text-primary">{t("guideReport.details")}</span><textarea value={details} maxLength={1500} rows={5} disabled={status === "submitting"} onChange={(event) => setDetails(event.target.value)} placeholder={t("guideReport.detailsPlaceholder")} className="w-full resize-none rounded-xl border border-outline-variant px-3 py-3 text-sm leading-6" /><span className="mt-1 block text-right text-[11px] text-on-surface-variant">{details.length}/1500</span></label>
            {status === "error" ? <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-semibold text-red-800" role="alert">{t("guideReport.error")}</p> : null}
            <div className="flex gap-3"><button type="button" disabled={status === "submitting"} onClick={close} className="h-11 flex-1 rounded-xl border border-outline-variant text-sm font-bold">{t("guideReport.cancel")}</button><button type="submit" disabled={status === "submitting"} className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-white disabled:opacity-60">{status === "submitting" ? <LoaderCircle size={16} className="animate-spin" /> : null}{t(status === "submitting" ? "guideReport.submitting" : "guideReport.submit")}</button></div>
          </form>}
      </section>
    </div> : null}
  </>;
}
```

- [ ] **Step 5: Run tests and commit**

Run:

```bash
bun test src/components/GuideReportButton.test.tsx src/i18n/translations.test.ts
bun run typecheck
```

Expected: PASS.

Commit:

```bash
git add src/components/GuideReportButton.tsx src/components/GuideReportButton.test.tsx src/i18n/translations.ts src/i18n/translations.test.ts
git commit -m "feat: add localized guide report form"
```

---

### Task 6: Put Reporting On Every Guide

**Files:**
- Modify: `src/pages/BlogDetail.tsx`
- Modify: `src/pages/BlogDetail.test.tsx`

- [ ] **Step 1: Write the failing placement test**

Add to `BlogDetail.test.tsx`:

```ts
import { BLOG_ARTICLES } from "../lib/blogContent";

it("places guide reporting after the references", () => {
  const markup = renderArticle("category-dmv");
  expect(markup).toContain("Report incorrect information");
  expect(markup.indexOf('id="guide-references"')).toBeLessThan(markup.indexOf("Report incorrect information"));
});

it("offers reporting on every published guide", () => {
  for (const article of BLOG_ARTICLES) {
    expect(renderArticle(article.id)).toContain("Report incorrect information");
  }
});
```

- [ ] **Step 2: Run and verify failure**

Run `bun test src/pages/BlogDetail.test.tsx`.

Expected: FAIL because `BlogDetail` does not render `GuideReportButton`.

- [ ] **Step 3: Render the reporting component**

Import `GuideReportButton` and render it after references:

```tsx
{citationSet ? <GuideReferences citationSet={citationSet} /> : null}
<section className="mx-4 mt-6 border-t border-outline-variant pt-5">
  <GuideReportButton article={article} />
</section>
```

- [ ] **Step 4: Run tests and commit**

Run:

```bash
bun test src/pages/BlogDetail.test.tsx src/components/GuideReportButton.test.tsx
bun run typecheck
```

Expected: PASS.

Commit:

```bash
git add src/pages/BlogDetail.tsx src/pages/BlogDetail.test.tsx
git commit -m "feat: offer corrections on every guide"
```

---

### Task 7: Privacy Documentation, Deployment, And End-To-End Verification

**Files:**
- Create: `e2e/guide-report.e2e.ts`
- Modify: `src/lib/legalContent.ts`
- Modify: `src/lib/legalContent.test.ts`
- Modify: `docs/DATA_INVENTORY.md`

- [ ] **Step 1: Add a failing privacy disclosure test**

Add to `legalContent.test.ts`:

```ts
test("discloses signed-in and anonymous guide correction reports", () => {
  const expected = {
    en: "guide correction reports",
    "zh-CN": "指南纠错报告",
    "zh-TW": "指南更正回報",
    yue: "指南更正報告",
    es: "reportes de corrección de guías",
  } as const;

  for (const language of languages) {
    const privacyText = JSON.stringify(getLegalDocument("privacy", language));
    expect(privacyText).toContain(expected[language]);
  }
  const englishPrivacy = JSON.stringify(getLegalDocument("privacy", "en"));
  expect(englishPrivacy).toContain("anonymous");
  expect(englishPrivacy).toContain("Supabase");
});
```

- [ ] **Step 2: Update policy and inventory**

Append this paragraph to the first privacy-policy section in each language:

```ts
const disclosure = {
  en: "Guide correction reports store the guide, section, language, reason, details, and review-date snapshot in Supabase. Signed-in reports include the account ID; anonymous reports do not request contact details or store an account ID.",
  "zh-CN": "指南纠错报告会在 Supabase 中保存指南、章节、语言、原因、说明和审核日期快照。登录后提交的报告会包含账户 ID；匿名报告不会要求联系方式，也不会保存账户 ID。",
  "zh-TW": "指南更正回報會在 Supabase 中儲存指南、章節、語言、原因、說明和審查日期快照。登入後提交的回報會包含帳戶 ID；匿名回報不會要求聯絡資料，也不會儲存帳戶 ID。",
  yue: "指南更正報告會喺 Supabase 儲存指南、章節、語言、原因、說明同覆核日期快照。登入後提交嘅報告會包括帳戶 ID；匿名報告唔會要求聯絡資料，亦唔會儲存帳戶 ID。",
  es: "Los reportes de corrección de guías guardan en Supabase la guía, sección, idioma, motivo, detalles y una copia de la fecha de revisión. Los reportes con sesión incluyen el ID de la cuenta; los reportes anónimos no solicitan datos de contacto ni guardan un ID de cuenta.",
};
```

Insert each localized string directly into its matching privacy document rather than introducing runtime mutation of legal content.

Add this section under **Activity** in `docs/DATA_INVENTORY.md`:

```md
### Guide correction reports (`public.content_reports`)

Guide readers may submit a correction report for a whole guide or a specific
section. Supabase stores the article ID, zero-based section index, interface
language, reason, optional details, citation review-date snapshot, queue status,
private review notes, and timestamps. A signed-in report also stores the
reporter's user ID; an anonymous report does not request contact information or
store an account ID.

Browser roles have no table grants or RLS policies for this queue. The Express
server inserts through its elevated Supabase client, and maintainers review rows
only in the Supabase Table Editor. Account export and deletion include reports
linked to that signed-in account. The server uses request addresses only for
in-memory rate limiting and does not persist them with reports.
```

- [ ] **Step 3: Add browser coverage for success and retry states**

Create `e2e/guide-report.e2e.ts`:

```ts
import { expect, test } from "@playwright/test";

test("submits a section-scoped anonymous correction report", async ({ page }) => {
  let submitted: Record<string, unknown> | null = null;
  await page.route("**/api/guides/reports", async (route) => {
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true }),
    });
  });

  await page.goto("/guides/california-driver-license-application");
  const references = page.locator('#guide-references');
  const reportButton = page.getByRole("button", { name: "Report incorrect information" });
  await expect(references).toBeVisible();
  await expect(reportButton).toBeVisible();
  expect(await references.evaluate((node, buttonText) => {
    const button = [...document.querySelectorAll("button")]
      .find((candidate) => candidate.textContent?.includes(buttonText));
    return button
      ? Boolean(node.compareDocumentPosition(button) & Node.DOCUMENT_POSITION_FOLLOWING)
      : false;
  }, "Report incorrect information")).toBe(true);

  await reportButton.click();
  const dialog = page.getByRole("dialog", { name: "Report a guide problem" });
  await expect(dialog).toBeVisible();
  await dialog.getByLabel("Reason").selectOption("translation");
  await dialog.getByLabel("Guide section").selectOption("0");
  await dialog.getByLabel("What happened when you tried this?").fill(
    "The translated document name is incorrect.",
  );
  await dialog.getByRole("button", { name: "Submit report" }).click();

  await expect(dialog.getByText("Thank you. Your report was added to the review queue.")).toBeVisible();
  expect(submitted).toMatchObject({
    articleId: "guide-1",
    sectionIndex: 0,
    language: "en",
    reason: "translation",
    details: "The translated document name is incorrect.",
  });
});

test("keeps report details available after a failed request", async ({ page }) => {
  await page.route("**/api/guides/reports", async (route) => {
    await route.fulfill({
      status: 500,
      contentType: "application/json",
      body: JSON.stringify({ error: "Unable to submit guide feedback right now" }),
    });
  });

  await page.goto("/guides/california-driver-license-application");
  await page.getByRole("button", { name: "Report incorrect information" }).click();
  const dialog = page.getByRole("dialog", { name: "Report a guide problem" });
  const details = dialog.getByLabel("What happened when you tried this?");
  await details.fill("The office link did not open.");
  await dialog.getByRole("button", { name: "Submit report" }).click();

  await expect(dialog.getByRole("alert")).toContainText("We could not submit this report");
  await expect(details).toHaveValue("The office link did not open.");
});
```

Run:

```bash
bunx playwright test e2e/guide-report.e2e.ts
```

Expected: both tests pass in desktop Chromium and mobile Chromium.

- [ ] **Step 4: Run all local verification**

Run:

```bash
bun test
bun run typecheck
bun run build
bunx playwright test e2e/guide-report.e2e.ts
git diff --check
```

Expected: all tests pass, typecheck exits 0, production build succeeds, and `git diff --check` prints nothing.

- [ ] **Step 5: Apply the Supabase schema script**

In Supabase SQL Editor for project `tdcgwdieflinwjmjgeyx`, run the complete contents of:

```text
supabase/content-reports.sql
```

Do not paste `.env` values into the editor.

- [ ] **Step 6: Verify live table privacy**

Using the configured anonymous key, request `content_reports?select=id&limit=1`. Expected: browser-role access is denied rather than returning queue data. Submit one report through the local UI and confirm one `open` row appears in Supabase Table Editor with the correct guide, section, language, reason, and review date.

- [ ] **Step 7: Visually verify desktop and mobile**

Run the production server, open one guide at desktop and 390px mobile widths, and verify:

- The report command is below References.
- The modal fits without clipped text.
- Reason and section controls are usable.
- Details remain after a simulated failed request.
- Success confirmation is localized.
- No report control overlaps the bottom navigation.

- [ ] **Step 8: Commit the documentation and verification work**

```bash
git add e2e/guide-report.e2e.ts src/lib/legalContent.ts src/lib/legalContent.test.ts docs/DATA_INVENTORY.md
git commit -m "docs: disclose guide correction reports"
```

The schema file is already committed in Task 2. Do not commit `.env`, screenshots containing user data, or Supabase exports.
