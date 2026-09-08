import { expect, test } from "bun:test";
import { buildGuideReport, createGuideReportHandler } from "./guideReportServer";

const input = { articleId: "category-dmv", sectionIndex: null, language: "en", reason: "outdated", details: "A link moved." };

test("derives guide review context server-side and rejects unknown guides and sections", () => {
  const report = buildGuideReport({ ...input, article_reviewed_at: "1900-01-01", status: "resolved" }, null);
  expect(report.ok).toBe(true);
  if (report.ok) {
    expect(report.value.article_reviewed_at).not.toBe("1900-01-01");
    expect(report.value.reporter_user_id).toBeNull();
    expect(report.value).not.toHaveProperty("status");
  }
  for (const patch of [{ articleId: "does-not-exist" }, { sectionIndex: 999 }, { sectionIndex: -1 }, { language: "xx" }, { details: "a".repeat(1501) }]) {
    expect(buildGuideReport({ ...input, ...patch }, null).ok).toBe(false);
  }
});

test("anonymous reports insert without auth; forged auth and database failures stay private", async () => {
  let inserted: unknown;
  let fail = false;
  const client = {
    auth: { getUser: async () => ({ data: { user: null }, error: Error("invalid token") }) },
    from: () => ({ insert: async (row: unknown) => { inserted = row; return { error: fail ? Error("private database details") : null }; } }),
  };
  const handler = createGuideReportHandler(client as any);
  let code = 0; let body: unknown;
  const response = { status(value: number) { code = value; return this; }, json(value: unknown) { body = value; return this; } };
  await handler({ headers: {}, body: input } as any, response as any, () => {});
  expect(code).toBe(201); expect(inserted).toMatchObject({ reporter_user_id: null });
  inserted = null;
  await handler({ headers: { authorization: "Bearer forged" }, body: input } as any, response as any, () => {});
  expect(code).toBe(401); expect(inserted).toBeNull();
  fail = true;
  await handler({ headers: {}, body: input } as any, response as any, () => {});
  expect(code).toBe(503); expect(body).toEqual({ code: "REPORT_FAILED" });
});
