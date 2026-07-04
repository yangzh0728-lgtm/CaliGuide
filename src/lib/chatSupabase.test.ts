import { describe, expect, it } from "bun:test";
import {
  buildChatMessageInserts,
  buildChatSessionUpsert,
  mapChatSessionRows,
} from "./chatSupabase";

const intro = { role: "bot" as const, content: "Hi", timestamp: "10:02 AM" };

describe("chatSupabase", () => {
  it("maps Supabase chat rows into ChatUserMemory", () => {
    const memory = mapChatSessionRows(
      [
        {
          id: "session-1",
          title: "DMV checklist",
          user_id: "user-1",
          created_at: "2026-07-04T04:00:00.000Z",
          updated_at: "2026-07-04T04:05:00.000Z",
          messages: [
            {
              id: "message-1",
              session_id: "session-1",
              user_id: "user-1",
              role: "user",
              content: "DMV checklist",
              created_at: "2026-07-04T04:01:00.000Z",
            },
            {
              id: "message-2",
              session_id: "session-1",
              user_id: "user-1",
              role: "bot",
              content: "Start with your ID documents.",
              created_at: "2026-07-04T04:02:00.000Z",
            },
          ],
        },
      ],
      intro,
    );

    expect(memory.activeSessionId).toBe("session-1");
    expect(memory.sessions[0].title).toBe("DMV checklist");
    expect(memory.messages).toEqual([
      { role: "user", content: "DMV checklist", timestamp: "04:01 AM" },
      { role: "bot", content: "Start with your ID documents.", timestamp: "04:02 AM" },
    ]);
  });

  it("builds session and message writes for Supabase", () => {
    expect(buildChatSessionUpsert("session-1", "user-1", "DMV checklist")).toEqual({
      id: "session-1",
      user_id: "user-1",
      title: "DMV checklist",
      updated_at: expect.any(String),
    });

    expect(
      buildChatMessageInserts("session-1", "user-1", [
        { role: "user", content: "Hello", timestamp: "9:00 AM" },
        { role: "bot", content: "Hi", timestamp: "9:01 AM" },
      ]),
    ).toEqual([
      { session_id: "session-1", user_id: "user-1", role: "user", content: "Hello" },
      { session_id: "session-1", user_id: "user-1", role: "bot", content: "Hi" },
    ]);
  });
});
