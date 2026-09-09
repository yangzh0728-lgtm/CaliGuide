import { describe, expect, it, mock } from "bun:test";
import { fetchRecentProfileChats } from "./profileRecentChats";

describe("profile recent chats", () => {
  it("loads the two most recently updated sessions owned by the user", async () => {
    const limit = mock(async () => ({
      data: [
        { id: "chat-2", title: "DMV documents", updated_at: "2026-09-02T12:00:00.000Z" },
        { id: "chat-1", title: "Housing search", updated_at: "2026-09-01T12:00:00.000Z" },
      ],
      error: null,
    }));
    const order = mock(() => ({ limit }));
    const eq = mock(() => ({ order }));
    const select = mock(() => ({ eq }));
    const client = { from: mock(() => ({ select })) };

    expect(await fetchRecentProfileChats(client, "user-1")).toEqual([
      { id: "chat-2", title: "DMV documents", updatedAt: "2026-09-02T12:00:00.000Z" },
      { id: "chat-1", title: "Housing search", updatedAt: "2026-09-01T12:00:00.000Z" },
    ]);
    expect(client.from).toHaveBeenCalledWith("chat_sessions");
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
    expect(order).toHaveBeenCalledWith("updated_at", { ascending: false });
    expect(limit).toHaveBeenCalledWith(2);
  });
});
