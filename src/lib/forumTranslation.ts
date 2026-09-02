import { resolveApiUrl } from "./apiUrl";

export type ForumTranslationLanguage = "en" | "zh-CN" | "zh-TW" | "es";
export type ForumTranslationSourceType = "post" | "comment";

export const FORUM_TRANSLATION_LANGUAGES: Array<{
  code: ForumTranslationLanguage;
  label: string;
  shortLabel: string;
}> = [
  { code: "en", label: "English", shortLabel: "EN" },
  { code: "zh-CN", label: "简体中文", shortLabel: "简" },
  { code: "zh-TW", label: "繁體中文", shortLabel: "繁" },
  { code: "es", label: "Español", shortLabel: "ES" },
];

export interface ForumTranslationInput {
  sourceType: ForumTranslationSourceType;
  sourceId: string;
  targetLanguage: ForumTranslationLanguage;
  title?: string;
  excerpt?: string;
  body: string[];
}

export interface ForumTranslationResult {
  title?: string;
  excerpt?: string;
  body: string[];
}

export function normalizeForumTranslationLanguage(value: unknown): ForumTranslationLanguage {
  return value === "zh-CN" || value === "zh-TW" || value === "es" ? value : "en";
}

export function getForumTranslationLanguage(language: ForumTranslationLanguage) {
  return FORUM_TRANSLATION_LANGUAGES.find((option) => option.code === language) ?? FORUM_TRANSLATION_LANGUAGES[0];
}

export async function requestForumTranslation(
  input: ForumTranslationInput,
  accessToken: string,
  apiBaseUrl = "",
  fetcher: typeof fetch = fetch,
): Promise<ForumTranslationResult> {
  const response = await fetcher(resolveApiUrl("/api/forum/translate", apiBaseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const responseText = await response.text();
  const payload = parseJsonObject(responseText);

  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string"
        ? payload.error
        : `Translation failed with HTTP ${response.status}`,
    );
  }

  const translation = payload.translation;
  return parseTranslationResult(translation, input);
}

function parseTranslationResult(value: unknown, input: ForumTranslationInput): ForumTranslationResult {
  if (!value || typeof value !== "object") {
    throw new Error("Translation response is invalid");
  }

  const result = value as Record<string, unknown>;
  if (
    !Array.isArray(result.body) ||
    (input.sourceType === "comment" && result.body.length !== input.body.length) ||
    result.body.length === 0 ||
    result.body.some((item) => typeof item !== "string" || !item.trim())
  ) {
    throw new Error("Translation response changed the forum body structure");
  }
  if (input.title !== undefined && (typeof result.title !== "string" || !result.title.trim())) {
    throw new Error("Translation response omitted the forum title");
  }
  if (input.excerpt !== undefined && (typeof result.excerpt !== "string" || !result.excerpt.trim())) {
    throw new Error("Translation response omitted the forum excerpt");
  }

  return {
    ...(typeof result.title === "string" ? { title: result.title } : {}),
    ...(typeof result.excerpt === "string" ? { excerpt: result.excerpt } : {}),
    body: result.body as string[],
  };
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}
