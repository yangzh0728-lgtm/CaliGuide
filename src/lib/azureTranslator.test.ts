import { describe, expect, it, mock } from "bun:test";
import {
  getAzureTranslatorConfig,
  translateForumContentWithAzure,
} from "./azureTranslator";

describe("Azure Translator", () => {
  it("reads server-only Translator configuration and normalizes the endpoint", () => {
    expect(
      getAzureTranslatorConfig({
        AZURE_TRANSLATOR_KEY: " secret-key ",
        AZURE_TRANSLATOR_ENDPOINT: "https://api.cognitive.microsofttranslator.com/",
        AZURE_TRANSLATOR_REGION: " westus2 ",
      }),
    ).toEqual({
      key: "secret-key",
      endpoint: "https://api.cognitive.microsofttranslator.com",
      region: "westus2",
    });
  });

  it("returns null when the subscription key is missing", () => {
    expect(getAzureTranslatorConfig({})).toBeNull();
  });

  it("translates supplied fields in order and omits the region header for a global resource", async () => {
    const fetcher = mock(async () =>
      new Response(
        JSON.stringify([
          { translations: [{ text: "住房问题", to: "zh-CN" }] },
          { translations: [{ text: "需要帮助", to: "zh-CN" }] },
          { translations: [{ text: "第一段", to: "zh-CN" }] },
          { translations: [{ text: "第二段", to: "zh-CN" }] },
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } },
      ),
    );

    const result = await translateForumContentWithAzure(
      {
        sourceType: "post",
        sourceId: "post-1",
        targetLanguage: "zh-CN",
        title: "Housing question",
        excerpt: "Need help",
        body: ["First paragraph", "Second paragraph"],
      },
      {
        key: "secret-key",
        endpoint: "https://api.cognitive.microsofttranslator.com",
        region: "global",
      },
      fetcher,
    );

    expect(result).toEqual({
      title: "住房问题",
      excerpt: "需要帮助",
      body: ["第一段", "第二段"],
    });
    expect(fetcher).toHaveBeenCalledTimes(1);

    const [url, options] = fetcher.mock.calls[0];
    expect(String(url)).toBe(
      "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans",
    );
    expect(options?.headers).toEqual({
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": "secret-key",
    });
    expect(JSON.parse(String(options?.body))).toEqual([
      { Text: "Housing question" },
      { Text: "Need help" },
      { Text: "First paragraph" },
      { Text: "Second paragraph" },
    ]);
  });

  it("maps CaliGuide Traditional Chinese to Azure's supported language code", async () => {
    const fetcher = mock(async () =>
      new Response(JSON.stringify([{ translations: [{ text: "繁體內容", to: "zh-Hant" }] }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await translateForumContentWithAzure(
      {
        sourceType: "comment",
        sourceId: "comment-2",
        targetLanguage: "zh-TW",
        body: ["Simplified content"],
      },
      {
        key: "secret-key",
        endpoint: "https://api.cognitive.microsofttranslator.com",
      },
      fetcher,
    );

    expect(String(fetcher.mock.calls[0][0])).toEndWith("api-version=3.0&to=zh-Hant");
  });

  it("sends the Azure region header for a regional resource", async () => {
    const fetcher = mock(async () =>
      new Response(JSON.stringify([{ translations: [{ text: "Hola", to: "es" }] }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await translateForumContentWithAzure(
      {
        sourceType: "comment",
        sourceId: "comment-1",
        targetLanguage: "es",
        body: ["Hello"],
      },
      {
        key: "secret-key",
        endpoint: "https://api.cognitive.microsofttranslator.com",
        region: "westus2",
      },
      fetcher,
    );

    expect(fetcher.mock.calls[0][1]?.headers).toEqual({
      "Content-Type": "application/json",
      "Ocp-Apim-Subscription-Key": "secret-key",
      "Ocp-Apim-Subscription-Region": "westus2",
    });
  });

  it("rejects incomplete Azure responses without leaking provider details", async () => {
    const fetcher = mock(async () =>
      new Response(JSON.stringify([{ translations: [] }]), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    await expect(
      translateForumContentWithAzure(
        {
          sourceType: "comment",
          sourceId: "comment-1",
          targetLanguage: "en",
          body: ["Hola"],
        },
        {
          key: "secret-key",
          endpoint: "https://api.cognitive.microsofttranslator.com",
        },
        fetcher,
      ),
    ).rejects.toThrow("Translation service returned an invalid response");
  });
});
