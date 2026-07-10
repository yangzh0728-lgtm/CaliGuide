import { readFileSync } from "fs";
import { describe, expect, it } from "bun:test";

describe("Supabase profile SQL", () => {
  it("creates every profile column used by the signup trigger", () => {
    const sql = readFileSync("supabase/account-profile-fields.sql", "utf8");

    expect(sql).toContain("add column if not exists date_of_birth date");
    expect(sql).toContain("add column if not exists sex text not null default 'prefer_not_to_say'");
    expect(sql).toContain("add column if not exists nationalities jsonb not null default '[]'::jsonb");
    expect(sql).toContain("date_of_birth,");
    expect(sql).toContain("sex,");
    expect(sql).toContain("nationalities,");
  });
});
