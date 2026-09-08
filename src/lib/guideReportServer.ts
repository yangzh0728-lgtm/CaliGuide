import type { RequestHandler } from "express";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getBlogArticle } from "./blogContent";
import { getGuideCitationSet } from "./guideCitations";
import { validateGuideIssueInput } from "./guideFeedback";

export function buildGuideReport(input: unknown, reporterId: string | null) {
  const validation = validateGuideIssueInput(input);
  if (validation.ok === false) return { ok: false as const, error: validation.error };
  const { articleId, sectionIndex, language, reason, details } = validation.value;
  const article = getBlogArticle(articleId);
  if (!article || (sectionIndex !== null && sectionIndex >= article.body.length)) {
    return { ok: false as const, error: "Invalid guide or section" };
  }
  const reviewedAt = getGuideCitationSet(articleId)?.references.map((ref) => ref.lastReviewedAt).sort().at(-1);
  if (!reviewedAt) return { ok: false as const, error: "Guide sources are unavailable" };
  return { ok: true as const, value: {
    article_id: articleId, section_index: sectionIndex, language,
    article_reviewed_at: reviewedAt, reason, details, reporter_user_id: reporterId,
  } };
}

export function createGuideReportHandler(client: SupabaseClient | null): RequestHandler {
  return async (req, res) => {
    if (!client) { res.status(503).json({ code: "REPORT_FAILED" }); return; }
    try {
      let reporterId: string | null = null;
      const authorization = req.headers.authorization;
      if (authorization !== undefined) {
        const token = /^Bearer\s+(\S+)$/i.exec(authorization)?.[1];
        if (!token) { res.status(401).json({ code: "SIGN_IN_REQUIRED" }); return; }
        const { data, error } = await client.auth.getUser(token);
        if (error || !data.user) { res.status(401).json({ code: "SIGN_IN_REQUIRED" }); return; }
        reporterId = data.user.id;
      }
      const report = buildGuideReport(req.body, reporterId);
      if (!report.ok) { res.status(400).json({ code: "INVALID_REPORT" }); return; }
      const { error } = await client.from("content_reports").insert(report.value);
      if (error) { res.status(503).json({ code: "REPORT_FAILED" }); return; }
      res.status(201).json({ ok: true });
    } catch {
      res.status(503).json({ code: "REPORT_FAILED" });
    }
  };
}
