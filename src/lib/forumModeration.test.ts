import { describe, expect, test } from "bun:test";
import { validateForumReportInput } from "./forumModeration";

const targetId = "11111111-1111-4111-8111-111111111111";

describe("forum moderation input", () => {
  test("accepts a supported report and trims its details", () => {
    expect(
      validateForumReportInput({
        targetType: "post",
        targetId,
        reason: "misinformation",
        details: "  The DMV deadline is inaccurate.  ",
      }),
    ).toEqual({
      ok: true,
      value: {
        targetType: "post",
        targetId,
        reason: "misinformation",
        details: "The DMV deadline is inaccurate.",
      },
    });
  });

  test("rejects invalid targets, reasons, and oversized details", () => {
    expect(validateForumReportInput({ targetType: "guide", targetId, reason: "spam" })).toEqual({
      ok: false,
      error: "Forum report target is invalid",
    });
    expect(validateForumReportInput({ targetType: "post", targetId: "post-1", reason: "spam" })).toEqual({
      ok: false,
      error: "Forum report target is invalid",
    });
    expect(validateForumReportInput({ targetType: "post", targetId, reason: "disagree" })).toEqual({
      ok: false,
      error: "Forum report reason is invalid",
    });
    expect(
      validateForumReportInput({ targetType: "comment", targetId, reason: "other", details: "x".repeat(1001) }),
    ).toEqual({ ok: false, error: "Forum report details must be 1000 characters or fewer" });
  });
});
