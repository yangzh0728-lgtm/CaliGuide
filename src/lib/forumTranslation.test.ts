import { describe, expect, it, mock } from "bun:test";
import {
  FORUM_TRANSLATION_LANGUAGES,
  requestForumTranslation,
} from "./forumTranslation";

describe("forum translation", () => {
  it("supports the four translation targets exposed in settings", () => {
    expect(FORUM_TRANSLATION_LANGUAGES.map((language) => language.code)).toEqual([
      "en",
      "zh-CN",
      "zh-TW",
      "es",
    ]);
  });

  it("sends an authenticated on-demand translation request", async () => {
    const fetcher = mock(async () =>
      new Response(JSON.stringify({ translation: { title: "住房", excerpt: "求助", body: ["正文"] } }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    const result = await requestForumTranslation(
      {
        sourceType: "post",
        sourceId: "post-1",
        targetLanguage: "zh-CN",
        title: "Housing",
        excerpt: "Help",
        body: ["Body"],
      },
      "access-token",
      "https://api.caliguide.org",
      fetcher,
    );

    expect(result.title).toBe("住房");
    expect(fetcher).toHaveBeenCalledTimes(1);
    const request = fetcher.mock.calls[0];
    expect(request[0]).toBe("https://api.caliguide.org/api/forum/translate");
    expect((request[1]?.headers as Record<string, string>).Authorization).toBe("Bearer access-token");
  });

  it("does not send forum content to the chatbot when the translation route is unavailable", async () => {
    const fetcher = mock(async () =>
      new Response(JSON.stringify({ error: "Translation service unavailable" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      requestForumTranslation(
        {
          sourceType: "post",
          sourceId: "post-1",
          targetLanguage: "es",
          title: "Housing",
          excerpt: "I need help",
          body: ["First paragraph", "Second paragraph"],
        },
        "access-token",
        "",
        fetcher,
      ),
    ).rejects.toThrow("Translation service unavailable");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
