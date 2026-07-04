import { afterEach, describe, expect, it } from "bun:test";
import { createForumPostViaApi } from "./forumApi";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
});

describe("forumApi", () => {
  it("sends forum posts through the server API with the current access token", async () => {
    let request: { url: string; init: RequestInit } | null = null;
    globalThis.fetch = (async (url, init) => {
      request = { url: String(url), init: init ?? {} };

      return new Response(
        JSON.stringify({
          post: {
            id: "post-1",
            user_id: "user-1",
            author_name: "Sam Y",
            author_avatar: "SY",
            category: "Housing",
            title: "test",
            excerpt: "test",
            body: ["test"],
            tags: ["Housing"],
            view_count: 0,
            created_at: "2026-07-04T09:00:00.000Z",
          },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as typeof fetch;

    const discussion = await createForumPostViaApi(
      {
        auth: {
          getSession: async () => ({
            data: { session: { access_token: "access-token" } },
            error: null,
          }),
        },
      },
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "user-1",
        author: "Sam Y",
        avatar: "SY",
        category: "Housing",
        title: "test",
        body: "test",
      },
    );

    expect(discussion.id).toBe("post-1");
    expect(request?.url).toBe("/api/forum/posts");
    expect((request?.init.headers as Record<string, string>).Authorization).toBe("Bearer access-token");
    expect(JSON.parse(String(request?.init.body))).toMatchObject({
      id: "11111111-1111-4111-8111-111111111111",
      title: "test",
      category: "Housing",
    });
  });

  it("surfaces server API errors", async () => {
    globalThis.fetch = (async () =>
      new Response(JSON.stringify({ error: "forum_posts schema is missing user_id" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })) as typeof fetch;

    await expect(
      createForumPostViaApi(
        {
          auth: {
            getSession: async () => ({
              data: { session: { access_token: "access-token" } },
              error: null,
            }),
          },
        },
        {
          userId: "user-1",
          author: "Sam Y",
          avatar: "SY",
          category: "Housing",
          title: "test",
          body: "test",
        },
      ),
    ).rejects.toThrow("forum_posts schema is missing user_id");
  });
});
