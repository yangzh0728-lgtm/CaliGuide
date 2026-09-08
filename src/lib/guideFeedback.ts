import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveApiUrl } from "./apiUrl";
import { isLanguageCode, type LanguageCode } from "../i18n/translations";

export const GUIDE_ISSUE_REASONS = [
  "outdated",
  "incorrect",
  "broken_link",
  "translation",
  "confusing",
] as const;

export type GuideIssueReason = (typeof GUIDE_ISSUE_REASONS)[number];

export interface GuideIssueInput {
  articleId: string;
  reason: GuideIssueReason;
  language: LanguageCode;
  sectionIndex: number | null;
  details?: string;
}

type SessionClient = SupabaseClient | {
  auth: {
    getSession: () => Promise<{
      data: { session: { access_token: string } | null };
      error: { message: string } | null;
    }>;
  };
};

export function validateGuideIssueInput(input: unknown):
  | { ok: true; value: Required<GuideIssueInput> }
  | { ok: false; error: string } {
  if (!input || typeof input !== "object") {
    return { ok: false, error: "Guide report is required" };
  }

  const value = input as Record<string, unknown>;
  const articleId = typeof value.articleId === "string" ? value.articleId.trim() : "";
  const reason = typeof value.reason === "string" ? value.reason : "";
  const details = typeof value.details === "string" ? value.details.trim() : "";

  if (!/^[a-z0-9][a-z0-9-]{0,99}$/i.test(articleId)) {
    return { ok: false, error: "Guide id is invalid" };
  }
  if (!GUIDE_ISSUE_REASONS.includes(reason as GuideIssueReason)) {
    return { ok: false, error: "Choose a valid report reason" };
  }
  if (typeof value.language !== "string" || !isLanguageCode(value.language)) return { ok: false, error: "Invalid language" };
  if (value.sectionIndex !== null && (!Number.isInteger(value.sectionIndex) || Number(value.sectionIndex) < 0)) {
    return { ok: false, error: "Invalid section" };
  }
  if (value.details !== undefined && typeof value.details !== "string") return { ok: false, error: "Invalid details" };
  if (details.length > 1500) {
    return { ok: false, error: "Report details must be 1,500 characters or fewer" };
  }

  return {
    ok: true,
    value: { articleId, reason: reason as GuideIssueReason, details, language: value.language, sectionIndex: value.sectionIndex as number | null },
  };
}

export async function reportGuideIssueViaApi(client: SessionClient, input: GuideIssueInput) {
  const validation = validateGuideIssueInput(input);
  if (validation.ok === false) {
    throw new Error(validation.error);
  }

  const { data, error } = await client.auth.getSession();
  if (error) throw new Error("REPORT_FAILED");

  const response = await fetch(resolveApiUrl("/api/guides/reports"), {
    method: "POST",
    headers: {
      ...(data.session?.access_token ? { Authorization: `Bearer ${data.session.access_token}` } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(validation.value),
  });
  if (!response.ok) {
    throw new Error(response.status === 429 ? "RATE_LIMITED" : "REPORT_FAILED");
  }
}
