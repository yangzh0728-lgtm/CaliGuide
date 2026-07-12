import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import {
  type ForumTranslationInput,
  type ForumTranslationResult,
} from "./forumTranslation";

const MODEL_LANGUAGE_NAMES = {
  en: "English",
  "zh-CN": "Simplified Chinese",
  "zh-TW": "Traditional Chinese",
  es: "Spanish",
} as const;

export function buildForumTranslationMessages(input: ForumTranslationInput): ChatCompletionMessageParam[] {
  const target = MODEL_LANGUAGE_NAMES[input.targetLanguage];
  const source = JSON.stringify({
    ...(input.title !== undefined ? { title: input.title } : {}),
    ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
    body: input.body,
  });

  return [
    {
      role: "system",
      content:
        `Translate user-generated community forum content into ${target}. ` +
        "Preserve meaning, names, URLs, numbers, and paragraph order. Do not add advice or moderation. " +
        "Return JSON only with title and excerpt when supplied plus body. The body must contain the same number of body items as the source.",
    },
    { role: "user", content: source },
  ];
}

export function parseForumTranslationCompletion(
  value: string,
  expected: {
    bodyCount: number;
    includeTitle: boolean;
    includeExcerpt: boolean;
    requireExactBodyCount: boolean;
  },
): ForumTranslationResult {
  const normalized = value.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  let parsed: unknown;

  try {
    parsed = JSON.parse(normalized);
  } catch {
    throw new Error("Translation service returned invalid JSON");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Translation service returned invalid JSON");
  }

  const result = parsed as Record<string, unknown>;
  if (
    !Array.isArray(result.body) ||
    (expected.requireExactBodyCount && result.body.length !== expected.bodyCount) ||
    result.body.length === 0 ||
    result.body.some((item) => typeof item !== "string" || !item.trim())
  ) {
    throw new Error("Translation service changed the forum body structure");
  }
  if (expected.includeTitle && (typeof result.title !== "string" || !result.title.trim())) {
    throw new Error("Translation service omitted the forum title");
  }
  if (expected.includeExcerpt && (typeof result.excerpt !== "string" || !result.excerpt.trim())) {
    throw new Error("Translation service omitted the forum excerpt");
  }

  return {
    ...(expected.includeTitle ? { title: result.title as string } : {}),
    ...(expected.includeExcerpt ? { excerpt: result.excerpt as string } : {}),
    body: result.body as string[],
  };
}
