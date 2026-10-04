import { describe, expect, it, mock } from "bun:test";
import { getGoogleTranslatorConfig, translateForumContentWithGoogle } from "./googleTranslator";
import type { ForumTranslationInput } from "./forumTranslation";

const input: ForumTranslationInput = {
  sourceType: "comment", sourceId: "comment-1", targetLanguage: "es", body: ["Hello"],
};
const config = { key: "private-test-key" };
const reply = (texts: unknown[]) => Response.json({
  data: { translations: texts.map((translatedText) => ({ translatedText })) },
});

describe("Google Cloud Translation", () => {
  it("reads only the server-side Google key", () => {
    expect(getGoogleTranslatorConfig({ GOOGLE_TRANSLATE_API_KEY: " key " })).toEqual({ key: "key" });
    expect(getGoogleTranslatorConfig({ GOOGLE_TRANSLATE_API_KEY: " " })).toBeNull();
    expect(getGoogleTranslatorConfig({ AZURE_TRANSLATOR_KEY: "old-key" })).toBeNull();
  });

  it("translates all fields in order using plain text and a private header", async () => {
    const fetcher = mock(async (_url: unknown, _options?: RequestInit) => reply(["Title", "Excerpt", "One", "Two"]));
    const result = await translateForumContentWithGoogle({
      ...input, targetLanguage: "zh-CN", title: "Title source", excerpt: "Excerpt source", body: ["First", "Second"],
    }, config, fetcher as typeof fetch);
    expect(result).toEqual({ title: "Title", excerpt: "Excerpt", body: ["One", "Two"] });
    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toBe("https://translation.googleapis.com/language/translate/v2");
    expect(options?.headers).toEqual({ "Content-Type": "application/json", "x-goog-api-key": config.key });
    expect(JSON.parse(String(options?.body))).toEqual({
      q: ["Title source", "Excerpt source", "First", "Second"], target: "zh-CN", format: "text",
    });
    expect(options?.signal).toBeInstanceOf(AbortSignal);
    expect(String(url)).not.toContain(config.key);
  });

  for (const language of ["en", "zh-CN", "zh-TW", "es"] as const) {
    it(`preserves the ${language} target code and comment shape`, async () => {
      const fetcher = mock(async (_url: unknown, _options?: RequestInit) => reply(["Translated"]));
      expect(await translateForumContentWithGoogle({ ...input, targetLanguage: language }, config, fetcher as typeof fetch))
        .toEqual({ body: ["Translated"] });
      expect(JSON.parse(String(fetcher.mock.calls[0][1]?.body)).target).toBe(language);
    });
  }

  it("batches more than 128 strings without changing paragraph order", async () => {
    const fetcher = mock(async (_url: unknown, options?: RequestInit) => {
      const { q } = JSON.parse(String(options?.body));
      expect(q.length).toBeLessThanOrEqual(128);
      return reply(q.map((text: string) => `translated ${text}`));
    });
    const body = Array.from({ length: 130 }, (_, i) => `paragraph ${i}`);
    expect(await translateForumContentWithGoogle({ ...input, body }, config, fetcher as typeof fetch))
      .toEqual({ body: body.map((text) => `translated ${text}`) });
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  for (const payload of [null, {}, { data: null }, { data: { translations: [] } },
    { data: { translations: [null] } }, { data: { translations: [{ translatedText: 12 }] } },
    { data: { translations: [{ translatedText: " " }] } }]) {
    it(`rejects malformed response ${JSON.stringify(payload)}`, async () => {
      await expect(translateForumContentWithGoogle(input, config, (async () => Response.json(payload)) as typeof fetch))
        .rejects.toThrow("Translation service returned an invalid response");
    });
  }

  it("rejects invalid JSON", async () => {
    await expect(translateForumContentWithGoogle(input, config, (async () => new Response("not json")) as typeof fetch))
      .rejects.toThrow("Translation service returned an invalid response");
  });

  it("reports HTTP status without exposing the Google error body", async () => {
    await expect(translateForumContentWithGoogle(input, config,
      (async () => new Response(config.key, { status: 403 })) as typeof fetch))
      .rejects.toThrow("Translation service request failed with HTTP 403");
  });

  it("sanitizes network errors", async () => {
    await expect(translateForumContentWithGoogle(input, config,
      (async () => { throw new Error(config.key); }) as typeof fetch))
      .rejects.toThrow("Translation service could not be reached");
  });
});
