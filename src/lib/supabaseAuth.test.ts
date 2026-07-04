import { describe, expect, it } from "bun:test";
import {
  buildPasswordResetRedirectUrl,
  formatSupabaseAuthError,
  mapSupabaseUser,
  profileInsertFromRegistration,
} from "./supabaseAuth";

describe("supabaseAuth", () => {
  it("maps a Supabase user, profile row, and saved guide ids into AuthUser", () => {
    const user = mapSupabaseUser({
      user: {
        id: "user-1",
        email: "maya@example.com",
        created_at: "2026-07-03T10:00:00.000Z",
        user_metadata: {},
      },
      profile: {
        id: "user-1",
        name: "Maya Chen",
        avatar_url: "https://example.com/avatar.png",
        member_since: "2026-07-03T10:00:00.000Z",
      },
      savedGuideIds: ["guide-1"],
    });

    expect(user).toEqual({
      id: "user-1",
      name: "Maya Chen",
      email: "maya@example.com",
      avatarUrl: "https://example.com/avatar.png",
      memberSince: "July 2026",
      savedGuideIds: ["guide-1"],
    });
  });

  it("falls back to user metadata and generated avatar when profile is missing", () => {
    const user = mapSupabaseUser({
      user: {
        id: "user-2",
        email: "no-profile@example.com",
        created_at: "2026-07-03T10:00:00.000Z",
        user_metadata: { name: "No Profile" },
      },
      profile: null,
      savedGuideIds: [],
    });

    expect(user.name).toBe("No Profile");
    expect(user.avatarUrl).toStartWith("data:image/svg+xml");
  });

  it("builds a profile insert row from registration input", () => {
    const row = profileInsertFromRegistration({
      id: "user-3",
      name: "  Elena Rivera  ",
      avatarUrl: "data:image/svg+xml,avatar",
    });

    expect(row).toEqual({
      id: "user-3",
      name: "Elena Rivera",
      avatar_url: "data:image/svg+xml,avatar",
    });
  });

  it("normalizes Supabase credential errors for the current UI", () => {
    expect(formatSupabaseAuthError({ message: "Invalid login credentials" })).toBe(
      "Email or password is incorrect",
    );
    expect(formatSupabaseAuthError({ message: "User already registered" })).toBe(
      "An account with this email already exists",
    );
  });

  it("builds a stable password reset redirect URL for the current app origin", () => {
    expect(buildPasswordResetRedirectUrl("http://localhost:3000/profile?tab=settings")).toBe(
      "http://localhost:3000/?password-recovery=1",
    );
  });
});
