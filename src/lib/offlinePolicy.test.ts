import { describe, expect, it } from "bun:test";
import { isOfflineCacheablePath } from "./offlinePolicy";

describe("offline cache policy", () => {
  it("allows public guides, trust pages, and static assets", () => {
    expect(isOfflineCacheablePath("/guides/california-real-id-documents")).toBe(true);
    expect(isOfflineCacheablePath("/privacy")).toBe(true);
    expect(isOfflineCacheablePath("/assets/index.js")).toBe(true);
  });

  it("never caches APIs or authenticated product areas", () => {
    expect(isOfflineCacheablePath("/api/chat")).toBe(false);
    expect(isOfflineCacheablePath("/forum/post-1")).toBe(false);
    expect(isOfflineCacheablePath("/chatbot")).toBe(false);
    expect(isOfflineCacheablePath("/profile")).toBe(false);
  });
});
