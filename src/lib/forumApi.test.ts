import { afterEach, describe, expect, it } from "bun:test";
import {
  createForumPostViaApi,
  deleteForumCommentViaApi,
  deleteForumPostViaApi,
  setForumVoteViaApi,
} from "./forumApi";

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

  it("creates forum posts directly in Supabase when the server API route is missing", async () => {
    let insertedRow: Record<string, unknown> | null = null;
    globalThis.fetch = (async () =>
      new Response("<!DOCTYPE html><pre>Cannot POST /api/forum/posts</pre>", {
        status: 404,
        headers: { "Content-Type": "text/html" },
      })) as typeof fetch;

    const discussion = await createForumPostViaApi(
      {
        auth: {
          getSession: async () => ({
            data: { session: { access_token: "access-token" } },
            error: null,
          }),
        },
        from: (table: string) => {
          expect(table).toBe("forum_posts");
          return {
            insert: (row: Record<string, unknown>) => {
              insertedRow = row;
              return {
                select: () => ({
                  single: async () => ({
                    data: {
                      ...row,
                      id: "11111111-1111-4111-8111-111111111111",
                      view_count: 0,
                      created_at: "2026-07-04T09:00:00.000Z",
                    },
                    error: null,
                  }),
                }),
              };
            },
          };
        },
      } as any,
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "user-1",
        author: "Sam Y",
        avatar: "SY",
        category: "Housing",
        title: "test",
        body: "test",
        imageUrls: ["data:image/png;base64,Zmlyc3Q="],
      },
    );

    expect(insertedRow?.image_urls).toEqual(["data:image/png;base64,Zmlyc3Q="]);
    expect(discussion.imageUrls).toEqual(["data:image/png;base64,Zmlyc3Q="]);
  });

  it("bypasses the server API for inline forum post images", async () => {
    let insertedRow: Record<string, unknown> | null = null;
    let requestCount = 0;
    globalThis.fetch = (async () => {
      requestCount += 1;
      throw new Error("The server API should not receive inline image payloads");
    }) as typeof fetch;

    const discussion = await createForumPostViaApi(
      {
        auth: {
          getSession: async () => ({
            data: { session: { access_token: "access-token" } },
            error: null,
          }),
        },
        from: (table: string) => {
          expect(table).toBe("forum_posts");
          return {
            insert: (row: Record<string, unknown>) => {
              insertedRow = row;
              return {
                select: () => ({
                  single: async () => ({
                    data: {
                      ...row,
                      id: "11111111-1111-4111-8111-111111111111",
                      view_count: 0,
                      created_at: "2026-07-04T09:00:00.000Z",
                    },
                    error: null,
                  }),
                }),
              };
            },
          };
        },
      } as any,
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "user-1",
        author: "Sam Y",
        avatar: "SY",
        category: "Housing",
        title: "test",
        body: "test",
        imageUrls: ["data:image/png;base64,cHJldmlldw=="],
      },
    );

    expect(requestCount).toBe(0);
    expect(insertedRow?.image_urls).toEqual(["data:image/png;base64,cHJldmlldw=="]);
    expect(discussion.imageUrls).toEqual(["data:image/png;base64,cHJldmlldw=="]);
  });

  it("falls back to direct Supabase insert when the server rejects a large post payload", async () => {
    let insertedRow: Record<string, unknown> | null = null;
    globalThis.fetch = (async () =>
      new Response("<!DOCTYPE html><pre>Payload Too Large</pre>", {
        status: 413,
        headers: { "Content-Type": "text/html" },
      })) as typeof fetch;

    const discussion = await createForumPostViaApi(
      {
        auth: {
          getSession: async () => ({
            data: { session: { access_token: "access-token" } },
            error: null,
          }),
        },
        from: (table: string) => {
          expect(table).toBe("forum_posts");
          return {
            insert: (row: Record<string, unknown>) => {
              insertedRow = row;
              return {
                select: () => ({
                  single: async () => ({
                    data: {
                      ...row,
                      id: "11111111-1111-4111-8111-111111111111",
                      view_count: 0,
                      created_at: "2026-07-04T09:00:00.000Z",
                    },
                    error: null,
                  }),
                }),
              };
            },
          };
        },
      } as any,
      {
        id: "11111111-1111-4111-8111-111111111111",
        userId: "user-1",
        author: "Sam Y",
        avatar: "SY",
        category: "Housing",
        title: "test",
        body: "test",
        imageUrls: ["https://cdn.example.com/forum/photo.png"],
      },
    );

    expect(insertedRow?.image_urls).toEqual(["https://cdn.example.com/forum/photo.png"]);
    expect(discussion.imageUrls).toEqual(["https://cdn.example.com/forum/photo.png"]);
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

  it("surfaces non-json server errors with status context", async () => {
    globalThis.fetch = (async () =>
      new Response("Route not found", {
        status: 404,
        headers: { "Content-Type": "text/plain" },
      })) as typeof fetch;

    await expect(
      deleteForumPostViaApi(
        {
          auth: {
            getSession: async () => ({
              data: { session: { access_token: "access-token" } },
              error: null,
            }),
          },
        },
        "11111111-1111-4111-8111-111111111111",
      ),
    ).rejects.toThrow("Forum sync failed with HTTP 404: Route not found");
  });

  it("deletes forum posts and comments through owner-scoped server APIs", async () => {
    const requests: Array<{ url: string; init: RequestInit }> = [];
    globalThis.fetch = (async (url, init) => {
      requests.push({ url: String(url), init: init ?? {} });
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;
    const client = {
      auth: {
        getSession: async () => ({
          data: { session: { access_token: "access-token" } },
          error: null,
        }),
      },
    };

    await deleteForumPostViaApi(client, "post-1");
    await deleteForumCommentViaApi(client, "comment-1");

    expect(requests.map((request) => request.url)).toEqual([
      "/api/forum/posts/delete",
      "/api/forum/comments/delete",
    ]);
    expect(JSON.parse(String(requests[0].init.body))).toEqual({ postId: "post-1" });
    expect(JSON.parse(String(requests[1].init.body))).toEqual({ commentId: "comment-1" });
    expect((requests[0].init.headers as Record<string, string>).Authorization).toBe("Bearer access-token");
  });

  it("falls back to direct Supabase deletes when the forum delete API route is missing", async () => {
    const deletedRows: Array<{ table: string; column: string; value: string }> = [];
    globalThis.fetch = (async (url) =>
      new Response(
        `<!DOCTYPE html><html><body><pre>Cannot POST ${String(url)}</pre></body></html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      )) as typeof fetch;
    const client = {
      auth: {
        getSession: async () => ({
          data: { session: { access_token: "access-token" } },
          error: null,
        }),
      },
      from(table: string) {
        return {
          delete() {
            return {
              eq(column: string, value: string) {
                return {
                  select() {
                    return {
                      maybeSingle() {
                        deletedRows.push({ table, column, value });
                        return Promise.resolve({ data: { id: value }, error: null });
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    };

    await deleteForumPostViaApi(client as any, "post-1");
    await deleteForumCommentViaApi(client as any, "comment-1");

    expect(deletedRows).toEqual([
      { table: "forum_posts", column: "id", value: "post-1" },
      { table: "forum_comments", column: "id", value: "comment-1" },
    ]);
  });

  it("does not treat a missing direct Supabase delete row as success", async () => {
    globalThis.fetch = (async (url) =>
      new Response(
        `<!DOCTYPE html><html><body><pre>Cannot POST ${String(url)}</pre></body></html>`,
        {
          status: 404,
          headers: { "Content-Type": "text/html" },
        },
      )) as typeof fetch;
    const client = {
      auth: {
        getSession: async () => ({
          data: { session: { access_token: "access-token" } },
          error: null,
        }),
      },
      from() {
        return {
          delete() {
            return {
              eq() {
                return {
                  select() {
                    return {
                      maybeSingle() {
                        return Promise.resolve({ data: null, error: null });
                      },
                    };
                  },
                };
              },
            };
          },
        };
      },
    };

    await expect(deleteForumPostViaApi(client as any, "post-1")).rejects.toThrow(
      "Forum post was not deleted. Please refresh and try again.",
    );
  });

  it("keeps votes on local mock forum items out of Supabase", async () => {
    let requestCount = 0;
    globalThis.fetch = (async () => {
      requestCount += 1;
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }) as typeof fetch;

    await setForumVoteViaApi(
      {
        auth: {
          getSession: async () => ({
            data: { session: { access_token: "access-token" } },
            error: null,
          }),
        },
      },
      "post",
      "post-1",
      "user-1",
      "useful",
    );

    expect(requestCount).toBe(0);
  });
});
