import { describe, expect, it } from "bun:test";

describe("moving checklist Supabase SQL", () => {
  it("creates an owner-scoped progress table with explicit grants and policies", async () => {
    const sql = await Bun.file("supabase/moving-checklist-progress.sql").text();

    expect(sql).toContain("create table if not exists public.moving_checklist_progress");
    expect(sql).toContain("completed_task_ids text[]");
    expect(sql).toContain("enable row level security");
    expect(sql).toContain("revoke all on table public.moving_checklist_progress from public, anon, authenticated");
    expect(sql).toContain("grant select, insert, update, delete on table public.moving_checklist_progress to authenticated");
    expect(sql).toContain("for select");
    expect(sql).toContain("for insert");
    expect(sql).toContain("for update");
    expect(sql).toContain("for delete");
    expect(sql).toContain("(select auth.uid()) = user_id");
  });
});
