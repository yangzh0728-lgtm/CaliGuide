import { describe, expect, it } from "bun:test";
import { CHAT_MAX_TOKENS, SYSTEM_PROMPT, buildChatCompletionRequest } from "./chatServer";

describe("chatServer", () => {
  it("builds a bounded streaming request for fast default replies", () => {
    const request = buildChatCompletionRequest({
      model: "deepseek-v4-flash",
      message: "DMV checklist",
      history: [],
    });

    expect(request).toMatchObject({
      model: "deepseek-v4-flash",
      stream: true,
      max_tokens: CHAT_MAX_TOKENS,
      temperature: 0.2,
    });
    expect(request.messages[0]).toEqual({
      role: "system",
      content: SYSTEM_PROMPT,
    });
    expect(SYSTEM_PROMPT).toContain("under 180 words");
  });

  it("keeps only non-empty chat history entries before the current user message", () => {
    const request = buildChatCompletionRequest({
      model: "deepseek-v4-flash",
      message: "next step?",
      history: [
        { role: "user", content: "I moved to California" },
        { role: "bot", content: " " },
        { role: "assistant", content: "Welcome. What do you need help with?" },
      ],
    });

    expect(request.messages.slice(1)).toEqual([
      { role: "user", content: "I moved to California" },
      { role: "assistant", content: "Welcome. What do you need help with?" },
      { role: "user", content: "next step?" },
    ]);
  });

  it("adds mem0 user-level memory to the system prompt when available", () => {
    const request = buildChatCompletionRequest({
      model: "deepseek-v4-flash",
      message: "What nation am I from?",
      memoryContext: "Relevant long-term user memory from mem0:\n- User is Chinese.\n- User prefers Mandarin.",
    });

    expect(request.messages[0].content).toContain("Relevant long-term user memory from mem0");
    expect(request.messages[0].content).toContain("User is Chinese.");
    expect(request.messages[0].content).toContain("User prefers Mandarin.");
  });
});
