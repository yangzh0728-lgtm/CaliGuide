import { describe, expect, it, mock } from "bun:test";
import {
  FORUM_TRANSLATION_LANGUAGES,
  requestForumTranslation,
} from "./forumTranslation";
import {
  buildForumTranslationMessages,
  parseForumTranslationCompletion,
} from "./forumTranslationServer";

describe("forum translation", () => {
  it("supports the four translation targets exposed in settings", () => {
    expect(FORUM_TRANSLATION_LANGUAGES.map((language) => language.code)).toEqual([
      "en",
      "zh-CN",
      "zh-TW",
      "es",
    ]);
  });

  it("builds a strict translation request that preserves body order", () => {
    const messages = buildForumTranslationMessages({
      sourceType: "post",
      sourceId: "post-1",
      targetLanguage: "es",
      title: "DMV question",
      excerpt: "I need help.",
      body: ["First paragraph", "Second paragraph"],
    });

    expect(messages[0].content).toContain("Spanish");
    expect(messages[1].content).toContain('"body":["First paragraph","Second paragraph"]');
    expect(messages[0].content).toContain("same number of body items");
  });

  it("parses fenced JSON and preserves strict comment paragraph mapping", () => {
    expect(
      parseForumTranslationCompletion(
        '```json\n{"title":"Pregunta","excerpt":"Ayuda","body":["Uno","Dos"]}\n```',
        { bodyCount: 2, includeTitle: true, includeExcerpt: true, requireExactBodyCount: true },
      ),
    ).toEqual({ title: "Pregunta", excerpt: "Ayuda", body: ["Uno", "Dos"] });

    expect(() =>
      parseForumTranslationCompletion('{"title":"Pregunta","excerpt":"Ayuda","body":["Uno"]}', {
        bodyCount: 2,
        includeTitle: true,
        includeExcerpt: true,
        requireExactBodyCount: true,
      }),
    ).toThrow("body structure");

    expect(
      parseForumTranslationCompletion('{"title":"Pregunta","excerpt":"Ayuda","body":["Uno y dos"]}', {
        bodyCount: 2,
        includeTitle: true,
        includeExcerpt: true,
        requireExactBodyCount: false,
      }),
    ).toEqual({ title: "Pregunta", excerpt: "Ayuda", body: ["Uno y dos"] });
  });

  it("accepts translated posts when the model merges source paragraphs", async () => {
    const fetcher = mock(async (url: string | URL | Request) => {
      if (String(url).endsWith("/api/forum/translate")) {
        return new Response("Cannot POST /api/forum/translate", { status: 404 });
      }

      return new Response(
        '{"title":"Vivienda","excerpt":"Necesito ayuda","body":["Primer y segundo párrafo"]}',
        { status: 200 },
      );
    });

    const result = await requestForumTranslation(
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
    );

    expect(result.body).toEqual(["Primer y segundo párrafo"]);
  });

  it("retries translated comments individually when the model merges replies", async () => {
    let chatRequest = 0;
    const fetcher = mock(async (url: string | URL | Request) => {
      if (String(url).endsWith("/api/forum/translate")) {
        return new Response("Cannot POST /api/forum/translate", { status: 404 });
      }

      chatRequest += 1;
      if (chatRequest === 1) {
        return new Response('{"body":["Dos respuestas combinadas"]}', { status: 200 });
      }
      return new Response(
        JSON.stringify({ body: [chatRequest === 2 ? "Primera respuesta" : "Segunda respuesta"] }),
        { status: 200 },
      );
    });

    const result = await requestForumTranslation(
      {
        sourceType: "comment",
        sourceId: "post-1:comments",
        targetLanguage: "es",
        body: ["First reply", "Second reply"],
      },
      "access-token",
      "",
      fetcher,
    );

    expect(result.body).toEqual(["Primera respuesta", "Segunda respuesta"]);
    expect(fetcher).toHaveBeenCalledTimes(4);
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

  it("falls back to the deployed chat API when the translation route is missing", async () => {
    const fetcher = mock(async (url: string | URL | Request) => {
      if (String(url).endsWith("/api/forum/translate")) {
        return new Response("Cannot POST /api/forum/translate", { status: 404 });
      }

      return new Response(
        '```json\n{"title":"Vivienda","excerpt":"Necesito ayuda","body":["Primer párrafo","Segundo párrafo"]}\n```',
        { status: 200 },
      );
    });

    const result = await requestForumTranslation(
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
    );

    expect(result).toEqual({
      title: "Vivienda",
      excerpt: "Necesito ayuda",
      body: ["Primer párrafo", "Segundo párrafo"],
    });
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(fetcher.mock.calls[1][0]).toBe("/api/chat");
    expect(JSON.parse(String(fetcher.mock.calls[1][1]?.body)).userId).toStartWith("forum-translation:");
  });
});
