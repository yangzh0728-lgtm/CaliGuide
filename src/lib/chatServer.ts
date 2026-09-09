export const CHAT_MAX_TOKENS = 360;
export const DEFAULT_CHAT_VISION_MODEL = "ernie-4.5-turbo-vl";

export const SYSTEM_PROMPT =
  "You are CaliBot, a research assistant for people settling in California. You help people find and understand official information about visas, documents, housing, banking, healthcare, and government processes. " +
  "You do not give legal advice and you never tell someone what they should do in their own case. Explain how a process generally works, point to the official agency, and recommend a qualified immigration attorney or a DOJ-accredited representative for anything specific to someone's situation. " +
  "Be warm, plain-spoken, and concise. Default to answers under 180 words unless the user asks for more detail. " +
  "Format replies as short paragraphs, optionally with a single level of bullets or a numbered list. Use **bold** only for key terms. Do not use tables, headings, links, code blocks, or nested lists.";

export type ChatHistoryMessage = {
  role: "user" | "bot" | "assistant";
  content: string;
  imageUrls?: string[];
};

type ChatContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

export function toChatMessages(
  message: string,
  history: ChatHistoryMessage[] = [],
  memoryContext?: string,
  imageUrls: string[] = [],
) {
  return [
    { role: "system" as const, content: buildSystemPrompt(memoryContext) },
    ...history
      .filter((item) => item.content?.trim())
      .map((item) =>
        item.role === "user"
          ? {
              role: "user" as const,
              content: buildMessageContent(item.content, item.imageUrls),
            }
          : {
              role: "assistant" as const,
              content: item.content,
            },
      ),
    { role: "user" as const, content: buildMessageContent(message, imageUrls) },
  ];
}

export function buildChatCompletionRequest({
  model,
  visionModel,
  message,
  history,
  memoryContext,
  imageUrls,
}: {
  model: string;
  visionModel?: string;
  message: string;
  history?: ChatHistoryMessage[];
  memoryContext?: string;
  imageUrls?: string[];
}) {
  const cleanImageUrls = imageUrls?.filter((url) => typeof url === "string" && url.trim()) ?? [];
  const activeVisionModel = visionModel?.trim() || DEFAULT_CHAT_VISION_MODEL;

  return {
    model: cleanImageUrls.length ? activeVisionModel : model,
    messages: toChatMessages(message, history, memoryContext, cleanImageUrls),
    stream: true as const,
    max_tokens: CHAT_MAX_TOKENS,
    temperature: 0.2,
  };
}

function buildSystemPrompt(memoryContext?: string) {
  const cleanMemoryContext = memoryContext?.trim();
  if (!cleanMemoryContext) {
    return SYSTEM_PROMPT;
  }

  return `${SYSTEM_PROMPT}\n\n${cleanMemoryContext}\nUse this memory when it directly helps answer the user's question, but do not reveal stored memory unless relevant.`;
}

function buildMessageContent(content: string, imageUrls: string[] = []): string | ChatContentPart[] {
  const cleanImageUrls = imageUrls.filter((url) => typeof url === "string" && url.trim());
  if (!cleanImageUrls.length) {
    return content;
  }

  return [
    ...cleanImageUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url },
    })),
    { type: "text", text: content },
  ];
}
