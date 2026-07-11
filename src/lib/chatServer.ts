export const CHAT_MAX_TOKENS = 360;

export const SYSTEM_PROMPT =
  "You are CaliBot, a professional immigration assistant for California. You help users with visa status, document preparation, and legal guidance. Be helpful, concise, and professional. Default to answers under 180 words unless the user asks for more detail. Remind users to consult a qualified immigration attorney for legal decisions.";

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

  return {
    model: cleanImageUrls.length && visionModel?.trim() ? visionModel.trim() : model,
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
    { type: "text", text: content },
    ...cleanImageUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url },
    })),
  ];
}
