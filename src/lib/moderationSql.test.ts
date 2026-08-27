import { describe, expect, test } from "bun:test";
import { readFileSync } from "node:fs";

describe("moderation Supabase migration", () => {
  const sql = readFileSync("supabase/moderation-and-reporting.sql", "utf8");

  test("creates a constrained forum report queue", () => {
    expect(sql).toContain("create table if not exists public.forum_reports");
    expect(sql).toContain("target_type in ('post', 'comment')");
    expect(sql).toContain("status in ('open', 'reviewing', 'resolved', 'dismissed')");
    expect(sql).toContain("reason in ('spam', 'harassment', 'unsafe_advice', 'misinformation', 'inappropriate_image', 'other')");
    expect(sql).toContain("create unique index if not exists forum_reports_open_unique");
  });

  test("keeps report access owner-scoped and review access server-only", () => {
    expect(sql).toContain("alter table public.forum_reports enable row level security");
    expect(sql).toContain("with check ((select auth.uid()) = reporter_user_id)");
    expect(sql).toContain("using ((select auth.uid()) = reporter_user_id)");
    expect(sql).toContain("grant select, insert on public.forum_reports to authenticated");
    expect(sql).not.toContain("grant update, delete on public.forum_reports to authenticated");
    expect(sql).not.toContain("raw_user_meta_data");
  });

  test("adds moderation state without auto-hiding reported content", () => {
    expect(sql).toContain("add column if not exists moderation_status text not null default 'visible'");
    expect(sql).toContain("moderation_status in ('visible', 'under_review', 'removed')");
    expect(sql).toContain("moderation_status = 'visible' or (select auth.uid()) = user_id");
    expect(sql).not.toContain("update public.forum_posts set moderation_status = 'removed'");
  });
});
