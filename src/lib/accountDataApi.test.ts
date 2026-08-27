import { afterEach, describe, expect, it } from "bun:test";
import { deleteAccountViaApi, requestAccountExportViaApi } from "./accountDataApi";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

const client = {
  auth: {
    getSession: async () => ({
      data: { session: { access_token: "access-token" } },
      error: null,
    }),
  },
};

describe("account data API", () => {
  it("downloads an authenticated account export", async () => {
    let request: { url: string; init?: RequestInit } | null = null;
    globalThis.fetch = (async (url, init) => {
      request = { url: String(url), init };
      return new Response(JSON.stringify({ exportedAt: "2026-08-27T00:00:00.000Z" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    const result = await requestAccountExportViaApi(client);

    expect(result).toEqual({ exportedAt: "2026-08-27T00:00:00.000Z" });
    expect(request?.url).toBe("/api/account/export");
    expect(request?.init?.method).toBe("GET");
    expect((request?.init?.headers as Record<string, string>).Authorization).toBe("Bearer access-token");
  });

  it("requires explicit confirmation before deleting an account", async () => {
    let request: { url: string; init?: RequestInit } | null = null;
    globalThis.fetch = (async (url, init) => {
      request = { url: String(url), init };
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }) as typeof fetch;

    await deleteAccountViaApi(client, "DELETE");

    expect(request?.url).toBe("/api/account/delete");
    expect(request?.init?.method).toBe("POST");
    expect(JSON.parse(String(request?.init?.body))).toEqual({ confirmation: "DELETE" });
  });
});
