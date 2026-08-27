import { afterEach, describe, expect, it } from "bun:test";
import { reportGuideIssueViaApi, validateGuideIssueInput } from "./guideFeedback";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("guide feedback", () => {
  it("validates structured correction reports", () => {
    expect(validateGuideIssueInput({
      articleId: "guide-1",
      reason: "outdated",
      details: "The fee appears to have changed.",
    })).toEqual({
      ok: true,
      value: {
        articleId: "guide-1",
        reason: "outdated",
        details: "The fee appears to have changed.",
      },
    });

    expect(validateGuideIssueInput({ articleId: "../secret", reason: "other" })).toEqual({
      ok: false,
      error: "Guide id is invalid",
    });
  });

  it("submits guide feedback with the signed-in session", async () => {
    let request: { url: string; init?: RequestInit } | null = null;
    globalThis.fetch = (async (url, init) => {
      request = { url: String(url), init };
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    await reportGuideIssueViaApi(
      {
        auth: {
          getSession: async () => ({
            data: { session: { access_token: "token" } },
            error: null,
          }),
        },
      },
      { articleId: "guide-1", reason: "broken_link", details: "Reference 2 is unavailable." },
    );

    expect(request?.url).toBe("/api/guides/reports");
    expect(request?.init?.method).toBe("POST");
    expect((request?.init?.headers as Record<string, string>).Authorization).toBe("Bearer token");
  });
});
