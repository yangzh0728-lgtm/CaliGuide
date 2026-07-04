export const CHAT_MAX_TOKENS = 360;

export const SYSTEM_PROMPT =
  "You are CaliBot, a professional immigration assistant for California. You help users with visa status, document preparation, and legal guidance. Be helpful, concise, and professional. Default to answers under 180 words unless the user asks for more detail. Remind users to consult a qualified immigration attorney for legal decisions.";

export type ChatHistoryMessage = {
  role: "user" | "bot" | "assistant";
  content: string;
};

export function toChatMessages(message: string, history: ChatHistoryMessage[] = []) {
  return [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...history
      .filter((item) => item.content?.trim())
      .map((item) => ({
        role: item.role === "user" ? ("user" as const) : ("assistant" as const),
        content: item.content,
      })),
    { role: "user" as const, content: message },
  ];
}

export function buildChatCompletionRequest({
  model,
  message,
  history,
}: {
  model: string;
  message: string;
  history?: ChatHistoryMessage[];
}) {
  return {
    model,
    messages: toChatMessages(message, history),
    stream: true as const,
    max_tokens: CHAT_MAX_TOKENS,
    temperature: 0.2,
  };
}
