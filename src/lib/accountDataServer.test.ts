import { describe, expect, it } from "bun:test";
import {
  ACCOUNT_DELETE_TABLES,
  ACCOUNT_EXPORT_TABLES,
  getAccountDeleteValidationError,
  getUserMediaPrefix,
} from "./accountDataServer";

describe("account data server helpers", () => {
  it("keeps the user-owned Supabase export inventory explicit", () => {
    expect(ACCOUNT_EXPORT_TABLES).toEqual([
      { table: "profiles", ownerColumn: "id" },
      { table: "saved_guides", ownerColumn: "user_id" },
      { table: "saved_forum_posts", ownerColumn: "user_id" },
      { table: "forum_posts", ownerColumn: "user_id" },
      { table: "forum_comments", ownerColumn: "user_id" },
      { table: "forum_votes", ownerColumn: "user_id" },
      { table: "chat_sessions", ownerColumn: "user_id" },
      { table: "chat_messages", ownerColumn: "user_id" },
      { table: "media_assets", ownerColumn: "owner_user_id" },
      { table: "forum_reports", ownerColumn: "reporter_user_id" },
    ]);
  });

  it("deletes dependent Supabase rows before the auth identity", () => {
    expect(ACCOUNT_DELETE_TABLES.map(({ table }) => table)).toEqual([
      "forum_reports",
      "forum_votes",
      "saved_forum_posts",
      "saved_guides",
      "forum_comments",
      "forum_posts",
      "chat_messages",
      "chat_sessions",
      "media_assets",
      "profiles",
    ]);
  });

  it("scopes Cloudflare media operations to one user's folder", () => {
    expect(getUserMediaPrefix("ABC-123")).toBe("assets/users/abc-123/");
  });

  it("requires the exact destructive confirmation", () => {
    expect(getAccountDeleteValidationError("DELETE")).toBeNull();
    expect(getAccountDeleteValidationError("delete")).toBe("Type DELETE to confirm account deletion.");
  });
});
