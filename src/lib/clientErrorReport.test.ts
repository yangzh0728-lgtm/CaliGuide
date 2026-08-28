import { describe, expect, it } from "bun:test";
import {
  normalizeClientErrorReport,
  redactClientErrorMessage,
} from "./clientErrorReport";

describe("client error reporting", () => {
  it("keeps only a bounded area, sanitized message, and pathname", () => {
    const report = normalizeClientErrorReport({
      area: "forum.sync",
      message: "Failed for sam@example.com at https://example.com/private?token=secret",
      path: "/forum/post-1?draft=private#comment",
    });

    expect(report).toEqual({
      area: "forum.sync",
      message: "Failed for [email] at [url]",
      path: "/forum/post-1",
    });
  });

  it("redacts credentials and identifiers from error messages", () => {
    const message = redactClientErrorMessage(
      "Bearer abc.def.ghi user 0a9f8eea-4e41-4482-bc05-bd41b9bb274f",
    );

    expect(message).toBe("Bearer [redacted] user [id]");
  });

  it("rejects malformed payloads", () => {
    expect(normalizeClientErrorReport(null)).toBeNull();
    expect(normalizeClientErrorReport({ area: "", message: "failed", path: "/" })).toBeNull();
    expect(normalizeClientErrorReport({ area: "chat", message: "", path: "/" })).toBeNull();
  });
});
