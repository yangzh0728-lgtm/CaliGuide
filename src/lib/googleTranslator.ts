import type { ForumTranslationInput, ForumTranslationResult } from "./forumTranslation";

const TRANSLATE_ENDPOINT = "https://translation.googleapis.com/language/translate/v2";
const MAX_STRINGS_PER_REQUEST = 128;

export interface GoogleTranslatorConfig {
  key: string;
}

export function getGoogleTranslatorConfig(
  env: Record<string, string | undefined>,
): GoogleTranslatorConfig | null {
  const key = env.GOOGLE_TRANSLATE_API_KEY?.trim();
  return key ? { key } : null;
}

export async function translateForumContentWithGoogle(
  input: ForumTranslationInput,
  config: GoogleTranslatorConfig,
  fetcher: typeof fetch = fetch,
): Promise<ForumTranslationResult> {
  const sourceTexts = [
    ...(input.title !== undefined ? [input.title] : []),
    ...(input.excerpt !== undefined ? [input.excerpt] : []),
    ...input.body,
  ];
  const translatedTexts: string[] = [];
  const signal = AbortSignal.timeout(30_000);

  // Google accepts at most 128 strings per request. Preserve paragraph order.
  for (let offset = 0; offset < sourceTexts.length; offset += MAX_STRINGS_PER_REQUEST) {
    const q = sourceTexts.slice(offset, offset + MAX_STRINGS_PER_REQUEST);
    let response: Response;
    try {
      response = await fetcher(TRANSLATE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": config.key },
        body: JSON.stringify({ q, target: input.targetLanguage, format: "text" }),
        signal,
      });
    } catch {
      throw new Error("Translation service could not be reached");
    }
    if (!response.ok) {
      throw new Error(`Translation service request failed with HTTP ${response.status}`);
    }

    let payload: unknown;
    try {
      payload = await response.json();
    } catch {
      throw new Error("Translation service returned an invalid response");
    }
    const data = payload && typeof payload === "object" && "data" in payload ? payload.data : null;
    const translations = data && typeof data === "object" && "translations" in data ? data.translations : null;
    if (!Array.isArray(translations) || translations.length !== q.length) {
      throw new Error("Translation service returned an invalid response");
    }
    for (const item of translations) {
      if (!item || typeof item.translatedText !== "string" || !item.translatedText.trim()) {
        throw new Error("Translation service returned an invalid response");
      }
      translatedTexts.push(item.translatedText);
    }
  }

  let index = 0;
  const title = input.title !== undefined ? translatedTexts[index++] : undefined;
  const excerpt = input.excerpt !== undefined ? translatedTexts[index++] : undefined;
  return {
    ...(title !== undefined ? { title } : {}),
    ...(excerpt !== undefined ? { excerpt } : {}),
    body: translatedTexts.slice(index),
  };
}
