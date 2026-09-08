import { describe, expect, test } from "bun:test";
import { buildProfileDetailUpdate, minimalSignupMetadata, needsDisplayName } from "./progressiveProfile";
import { mapSupabaseUser } from "./supabaseAuth";

describe("progressive profile", () => {
  test("signup does not invent demographic answers", () => {
    const data = minimalSignupMetadata();
    expect(data.name).toBe("CaliGuide Member");
    expect(data.arrival_status_provided).toBe(false);
    for (const key of ["date_of_birth", "sex", "nationalities", "current_location", "arrival_status"])
      expect(data).not.toHaveProperty(key);
  });

  test("only the requested field is updated", () => {
    expect(buildProfileDetailUpdate({ kind: "name", value: "  River  " })).toEqual({
      profile: { name: "River" }, metadata: { name: "River" },
    });
    expect(buildProfileDetailUpdate({ kind: "arrival", value: "arrived" })).toEqual({
      profile: { arrival_status: "arrived" },
      metadata: { arrival_status: "arrived", arrival_status_provided: true },
    });
    expect(() => buildProfileDetailUpdate({ kind: "name", value: " " })).toThrow();
    expect(() => buildProfileDetailUpdate({ kind: "name", value: "a".repeat(81) })).toThrow();
    expect(() => buildProfileDetailUpdate({ kind: "arrival", value: "unknown" })).toThrow();
  });

  test("missing names never expose the email as a public author name", () => {
    const user = mapSupabaseUser({ user: { id: "reader", email: "private-name@example.com" }, profile: null, savedGuideIds: [], savedPostIds: [] });
    expect(user.name).toBe("CaliGuide Member");
    expect(needsDisplayName(user.name)).toBe(true);
    expect(needsDisplayName("River")).toBe(false);
  });

  test("a database default is not an explicitly supplied arrival stage", () => {
    const base = { user: { id: "reader", user_metadata: { arrival_status_provided: false } },
      profile: { arrival_status: "planning" } as any, savedGuideIds: [], savedPostIds: [] };
    expect(mapSupabaseUser(base).arrivalStatusProvided).toBe(false);
    expect(mapSupabaseUser({ ...base, user: { id: "reader", user_metadata: { arrival_status_provided: true } } }).arrivalStatusProvided).toBe(true);
    expect(mapSupabaseUser({ ...base, user: { id: "reader" }, profile: null }).arrivalStatusProvided).toBe(false);
    expect(mapSupabaseUser({ ...base, user: { id: "google-reader", user_metadata: { full_name: "River" } } }).arrivalStatusProvided).toBe(false);
  });
});
