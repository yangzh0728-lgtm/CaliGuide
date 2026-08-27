import { isSupabaseUuid } from "./uuid";

export const forumReportReasons = [
  "spam",
  "harassment",
  "unsafe_advice",
  "misinformation",
  "inappropriate_image",
  "other",
] as const;

export type ForumReportReason = (typeof forumReportReasons)[number];
export type ForumReportTargetType = "post" | "comment";

export interface ValidForumReportInput {
  targetType: ForumReportTargetType;
  targetId: string;
  reason: ForumReportReason;
  details: string;
}

export function validateForumReportInput(
  input: unknown,
): { ok: true; value: ValidForumReportInput } | { ok: false; error: string } {
  const record = input && typeof input === "object" ? (input as Record<string, unknown>) : {};
  const targetType = record.targetType;
  const targetId = record.targetId;
  const reason = record.reason;
  const details = typeof record.details === "string" ? record.details.trim() : "";

  if (
    (targetType !== "post" && targetType !== "comment") ||
    typeof targetId !== "string" ||
    !isSupabaseUuid(targetId)
  ) {
    return { ok: false, error: "Forum report target is invalid" };
  }

  if (typeof reason !== "string" || !forumReportReasons.includes(reason as ForumReportReason)) {
    return { ok: false, error: "Forum report reason is invalid" };
  }

  if (details.length > 1000) {
    return { ok: false, error: "Forum report details must be 1000 characters or fewer" };
  }

  return {
    ok: true,
    value: {
      targetType,
      targetId,
      reason: reason as ForumReportReason,
      details,
    },
  };
}
