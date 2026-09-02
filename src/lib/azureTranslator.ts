import type {
  ForumTranslationInput,
  ForumTranslationResult,
} from "./forumTranslation";

const DEFAULT_TRANSLATOR_ENDPOINT = "https://api.cognitive.microsofttranslator.com";
const AZURE_LANGUAGE_CODES = {
  en: "en",
  "zh-CN": "zh-Hans",
  "zh-TW": "zh-Hant",
  es: "es",
} as const;

export interface AzureTranslatorConfig {
  key: string;
  endpoint: string;
  region?: string;
}

interface AzureTranslationItem {
  translations?: Array<{
    text?: unknown;
    to?: unknown;
  }>;
}

export function getAzureTranslatorConfig(
  env: Record<string, string | undefined>,
): AzureTranslatorConfig | null {
  const key = env.AZURE_TRANSLATOR_KEY?.trim();
  if (!key) {
    return null;
  }

  const endpoint = (env.AZURE_TRANSLATOR_ENDPOINT?.trim() || DEFAULT_TRANSLATOR_ENDPOINT).replace(
    /\/+$/,
    "",
  );
  const region = env.AZURE_TRANSLATOR_REGION?.trim();

  return {
    key,
    endpoint,
    ...(region ? { region } : {}),
  };
}

export async function translateForumContentWithAzure(
  input: ForumTranslationInput,
  config: AzureTranslatorConfig,
  fetcher: typeof fetch = fetch,
): Promise<ForumTranslationResult> {
  const sourceTexts = [
    ...(input.title !== undefined ? [input.title] : []),
    ...(input.excerpt !== undefined ? [input.excerpt] : []),
    ...input.body,
  ];
  const url = new URL(`${config.endpoint}/translate`);
  url.searchParams.set("api-version", "3.0");
  url.searchParams.set("to", AZURE_LANGUAGE_CODES[input.targetLanguage]);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Ocp-Apim-Subscription-Key": config.key,
  };
  if (config.region && config.region.toLowerCase() !== "global") {
    headers["Ocp-Apim-Subscription-Region"] = config.region;
  }

  const response = await fetcher(url, {
    method: "POST",
    headers,
    body: JSON.stringify(sourceTexts.map((text) => ({ Text: text }))),
  });
  if (!response.ok) {
    throw new Error(`Translation service request failed with HTTP ${response.status}`);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new Error("Translation service returned an invalid response");
  }

  if (!Array.isArray(payload) || payload.length !== sourceTexts.length) {
    throw new Error("Translation service returned an invalid response");
  }

  const translatedTexts = (payload as AzureTranslationItem[]).map(
    (item) => item.translations?.[0]?.text,
  );
  if (translatedTexts.some((text) => typeof text !== "string" || !text.trim())) {
    throw new Error("Translation service returned an invalid response");
  }

  let index = 0;
  const title = input.title !== undefined ? (translatedTexts[index++] as string) : undefined;
  const excerpt = input.excerpt !== undefined ? (translatedTexts[index++] as string) : undefined;

  return {
    ...(title !== undefined ? { title } : {}),
    ...(excerpt !== undefined ? { excerpt } : {}),
    body: translatedTexts.slice(index) as string[],
  };
}
