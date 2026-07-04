import { describe, expect, it } from "bun:test";
import {
  addMem0Conversation,
  buildMem0MemoryContext,
  getRelevantMem0Memories,
  searchMem0Memories,
} from "./mem0Memory";

describe("mem0Memory", () => {
  it("formats user-level memories for prompt context", () => {
    const context = buildMem0MemoryContext([
      { memory: "User is Chinese." },
      { memory: "User prefers Mandarin." },
    ]);

    expect(context).toContain("User is Chinese.");
    expect(context).toContain("User prefers Mandarin.");
  });

  it("searches mem0 memories by user id", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ results: [{ memory: "User is from China." }] }), {
        status: 200,
      });
    };

    const memories = await searchMem0Memories({
      apiKey: "mem0-test-key",
      userId: "user-1",
      query: "What nation am I from?",
      fetcher,
    });

    expect(memories).toEqual([{ memory: "User is from China." }]);
    expect(requests[0].url).toBe("https://api.mem0.ai/v1/memories/search/");
    expect(requests[0].init?.method).toBe("POST");
    expect(requests[0].init?.headers).toEqual({
      Authorization: "Token mem0-test-key",
      "Content-Type": "application/json",
    });
    expect(JSON.parse(String(requests[0].init?.body))).toMatchObject({
      user_id: "user-1",
      query: "What nation am I from?",
    });
  });

  it("adds each completed conversation turn to mem0", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetcher = async (url: string | URL | Request, init?: RequestInit) => {
      requests.push({ url: String(url), init });
      return new Response(JSON.stringify({ id: "memory-1" }), { status: 200 });
    };

    await addMem0Conversation({
      apiKey: "mem0-test-key",
      userId: "user-1",
      messages: [
        { role: "user", content: "I am Chinese." },
        { role: "assistant", content: "I will remember that for future answers." },
      ],
      fetcher,
    });

    expect(requests[0].url).toBe("https://api.mem0.ai/v1/memories/");
    expect(JSON.parse(String(requests[0].init?.body))).toEqual({
      user_id: "user-1",
      messages: [
        { role: "user", content: "I am Chinese." },
        { role: "assistant", content: "I will remember that for future answers." },
      ],
    });
  });

  it("falls back to listed user memories when semantic search misses", async () => {
    const requests: string[] = [];
    const fetcher = async (url: string | URL | Request) => {
      requests.push(String(url));

      if (String(url).includes("/search/")) {
        return new Response(JSON.stringify([]), { status: 200 });
      }

      return new Response(
        JSON.stringify({
          results: [{ id: "memory-1", memory: "User is Chinese and speaks Mandarin" }],
        }),
        { status: 200 },
      );
    };

    const memories = await getRelevantMem0Memories({
      apiKey: "mem0-test-key",
      userId: "user-1",
      query: "What nation am I from?",
      fetcher,
    });

    expect(memories).toEqual([{ memory: "User is Chinese and speaks Mandarin" }]);
    expect(requests).toEqual([
      "https://api.mem0.ai/v1/memories/search/",
      "https://api.mem0.ai/v1/memories/?user_id=user-1&page=1&page_size=10",
    ]);
  });
});
