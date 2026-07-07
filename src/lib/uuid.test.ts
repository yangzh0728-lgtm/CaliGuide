import { describe, expect, it } from "bun:test";
import { isSupabaseUuid } from "./uuid";

describe("uuid", () => {
  it("recognizes Supabase UUID ids and rejects local mock ids", () => {
    expect(isSupabaseUuid("33333333-3333-4333-8333-333333333333")).toBe(true);
    expect(isSupabaseUuid("post-1")).toBe(false);
    expect(isSupabaseUuid("comment-1")).toBe(false);
  });
});
