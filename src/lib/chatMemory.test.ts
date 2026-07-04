import { describe, expect, it } from "bun:test";
import {
  CHAT_MEMORY_STORAGE_KEY,
  appendChatMemoryMessages,
  createChatMemoryState,
  deleteChatMemorySession,
  loadChatMemoryState,
  saveChatMemoryState,
  startChatMemorySession,
} from "./chatMemory";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return Array.from(this.values.keys())[index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

describe("chatMemory", () => {
  it("stores chat sessions per user and restores them from storage", () => {
    const storage = new MemoryStorage();
    const state = appendChatMemoryMessages(createChatMemoryState(), "user-1", [
      { role: "user", content: "I am Chinese", timestamp: "9:00 AM" },
      { role: "bot", content: "Got it.", timestamp: "9:01 AM" },
    ]);

    saveChatMemoryState(storage, state);

    expect(storage.getItem(CHAT_MEMORY_STORAGE_KEY)).toContain("I am Chinese");
    expect(loadChatMemoryState(storage).sessionsByUserId["user-1"].messages).toHaveLength(2);
  });

  it("does not store user profile facts locally because long-term memory belongs to mem0", () => {
    const state = appendChatMemoryMessages(createChatMemoryState(), "user-1", [
      { role: "user", content: "I am Chinese and I speak Mandarin.", timestamp: "9:00 AM" },
    ]);

    expect(state.sessionsByUserId["user-1"]).not.toHaveProperty("profile");
  });

  it("deletes one chat session and switches to the next available session", () => {
    const intro = { role: "bot" as const, content: "Hi", timestamp: "10:02 AM" };
    const first = appendChatMemoryMessages(createChatMemoryState(), "user-1", [
      { role: "user", content: "First chat", timestamp: "9:00 AM" },
    ]);
    const second = appendChatMemoryMessages(
      startChatMemorySession(first, "user-1", intro),
      "user-1",
      [{ role: "user", content: "Second chat", timestamp: "9:05 AM" }],
    );
    const activeSessionId = second.sessionsByUserId["user-1"].activeSessionId;

    const deleted = deleteChatMemorySession(second, "user-1", activeSessionId, intro);

    expect(deleted.sessionsByUserId["user-1"].sessions).toHaveLength(1);
    expect(deleted.sessionsByUserId["user-1"].messages.at(-1)?.content).toBe("First chat");
  });

  it("keeps a fresh intro session when deleting the last chat session", () => {
    const intro = { role: "bot" as const, content: "Hi", timestamp: "10:02 AM" };
    const state = appendChatMemoryMessages(createChatMemoryState(), "user-1", [
      { role: "user", content: "Only chat", timestamp: "9:00 AM" },
    ]);
    const onlySessionId = state.sessionsByUserId["user-1"].activeSessionId;

    const deleted = deleteChatMemorySession(state, "user-1", onlySessionId, intro);

    expect(deleted.sessionsByUserId["user-1"].sessions).toHaveLength(1);
    expect(deleted.sessionsByUserId["user-1"].messages).toEqual([intro]);
  });
});
