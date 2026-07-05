import { describe, expect, it } from "bun:test";
import {
  buildForumCommentInsert,
  buildForumPostInsert,
  buildForumVoteUpsert,
  fetchForumDiscussionsFromSupabase,
  mapForumPostRows,
} from "./forumSupabase";

describe("forumSupabase", () => {
  it("maps forum posts, comments, and votes into ForumDiscussion objects", () => {
    const discussions = mapForumPostRows([
      {
        id: "post-1",
        user_id: "user-1",
        author_name: "Maya Chen",
        author_avatar: "MC",
        category: "Housing",
        title: "Where should I rent first?",
        excerpt: "I am comparing school access and commute.",
        body: ["I need a practical rental checklist."],
        tags: ["Housing", "Schools"],
        view_count: 12,
        created_at: "2026-07-04T04:00:00.000Z",
        comments: [
          {
            id: "comment-1",
            post_id: "post-1",
            user_id: "user-2",
            author_name: "Leo C.",
            author_avatar: "LC",
            body: "Check school boundaries before applying.",
            created_at: "2026-07-04T04:05:00.000Z",
          },
        ],
        votes: [
          { user_id: "user-3", vote_type: "useful", target_type: "post", target_id: "post-1" },
          { user_id: "user-4", vote_type: "unuseful", target_type: "post", target_id: "post-1" },
        ],
        comment_votes: [
          { user_id: "user-1", vote_type: "useful", target_type: "comment", target_id: "comment-1" },
        ],
      },
    ]);

    expect(discussions[0]).toMatchObject({
      id: "post-1",
      userId: "user-1",
      author: "Maya Chen",
      avatar: "MC",
      category: "Housing",
      title: "Where should I rent first?",
      comments: 1,
      views: "12",
      usefulUserIds: ["user-3"],
      unusefulUserIds: ["user-4"],
    });
    expect(discussions[0].replies[0]).toMatchObject({
      id: "comment-1",
      author: "Leo C.",
      usefulUserIds: ["user-1"],
    });
  });

  it("still returns posts when comments or votes are not readable", async () => {
    const client = {
      from(table: string) {
        if (table === "forum_posts") {
          return {
            select() {
              return {
                order: async () => ({
                  data: [
                    {
                      id: "post-remote",
                      user_id: "user-owner",
                      author_name: "Owner",
                      author_avatar: "OW",
                      category: "Housing",
                      title: "Remote post",
                      excerpt: "Visible even when vote reads fail.",
                      body: ["Visible even when vote reads fail."],
                      tags: ["Housing"],
                      view_count: 0,
                      created_at: "2026-07-04T04:00:00.000Z",
                    },
                  ],
                  error: null,
                }),
              };
            },
          };
        }

        return {
          select() {
            return {
              in: async () => ({
                data: null,
                error: { message: `permission denied for table ${table}` },
              }),
            };
          },
        };
      },
    };

    const discussions = await fetchForumDiscussionsFromSupabase(client);

    expect(discussions).toHaveLength(1);
    expect(discussions[0]).toMatchObject({
      id: "post-remote",
      userId: "user-owner",
      title: "Remote post",
      replies: [],
      usefulUserIds: [],
      unusefulUserIds: [],
    });
  });

  it("builds inserts for forum posts, comments, and votes", () => {
    expect(
      buildForumPostInsert({
        id: "11111111-1111-4111-8111-111111111111",
        userId: "user-1",
        author: "Maya Chen",
        avatar: "MC",
        category: "Housing",
        title: "Rental checklist",
        body: "What should I prepare?",
      }),
    ).toMatchObject({
      id: "11111111-1111-4111-8111-111111111111",
      user_id: "user-1",
      author_id: "user-1",
      author_name: "Maya Chen",
      author_avatar: "MC",
      category: "Housing",
      title: "Rental checklist",
      tags: ["Housing", "Community", "New Post"],
    });

    expect(
      buildForumCommentInsert({
        postId: "post-1",
        userId: "user-1",
        author: "Maya Chen",
        avatar: "MC",
        body: "Bring proof of income.",
      }),
    ).toEqual({
      post_id: "post-1",
      user_id: "user-1",
      author_id: "user-1",
      author_name: "Maya Chen",
      author_avatar: "MC",
      body: "Bring proof of income.",
    });

    expect(buildForumVoteUpsert("post", "post-1", "user-1", "useful")).toEqual({
      target_type: "post",
      target_id: "post-1",
      user_id: "user-1",
      author_id: "user-1",
      vote_type: "useful",
    });
  });
});
