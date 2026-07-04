import { describe, expect, it } from "bun:test";
import {
  addForumComment,
  createForumDiscussion,
  filterForumDiscussions,
  FORUM_DISCUSSIONS,
  FORUM_TOPICS,
  getForumReplyCount,
  getUnusefulCount,
  getUsefulCount,
  isUnusefulByUser,
  isUsefulByUser,
  toggleCommentUnuseful,
  toggleCommentUseful,
  toggleDiscussionUnuseful,
  toggleDiscussionUseful,
} from "./forumContent";

describe("forumContent", () => {
  it("filters discussions by search text and category", () => {
    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "chase", "All Topics").map((post) => post.id)).toEqual([
      "post-2",
    ]);

    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "", "Housing").map((post) => post.id)).toEqual([
      "post-1",
    ]);

    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "visa", "All Topics").map((post) => post.id)).toEqual([
      "post-4",
    ]);
  });

  it("creates a user discussion with forum detail fields", () => {
    const discussion = createForumDiscussion({
      title: "What should I prepare for my first apartment tour?",
      category: "Housing",
      body: "I want to know what documents and questions to bring.",
      author: "Preview User",
    });

    expect(discussion.title).toBe("What should I prepare for my first apartment tour?");
    expect(discussion.category).toBe("Housing");
    expect(discussion.author).toBe("Preview User");
    expect(discussion.id).toMatch(/^[0-9a-f-]{36}$/);
    expect(discussion.comments).toBe(0);
    expect(discussion.body[0]).toContain("I want to know");
    expect(discussion.body.join(" ")).not.toMatch(/placeholder/i);
    expect(discussion.tags).toContain("Housing");
  });

  it("uses actual replies as the forum comment count", () => {
    const discussion = FORUM_DISCUSSIONS[0];

    expect(getForumReplyCount(discussion)).toBe(discussion.replies.length);
    expect(getForumReplyCount(discussion)).not.toBe(discussion.comments);
  });

  it("adds a comment without mutating the original discussion", () => {
    const discussion = createForumDiscussion({
      title: "Can I comment on this post?",
      category: "Housing",
      body: "I want the detail page to accept comments.",
      author: "Preview User",
    });

    const updated = addForumComment(discussion, {
      author: "Maya Chen",
      body: "This is a helpful answer from the forum.",
    });

    expect(discussion.replies).toHaveLength(0);
    expect(updated.replies).toHaveLength(1);
    expect(updated.replies[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(updated.replies[0].author).toBe("Maya Chen");
    expect(updated.replies[0].avatar).toBe("MC");
    expect(updated.replies[0].body).toBe("This is a helpful answer from the forum.");
    expect(getForumReplyCount(updated)).toBe(1);
  });

  it("toggles usefulness votes for discussions and comments", () => {
    const discussion = FORUM_DISCUSSIONS[0];
    const userId = "user-1";
    const basePostUsefulCount = getUsefulCount(discussion);
    const baseCommentUsefulCount = getUsefulCount(discussion.replies[0]);

    const usefulDiscussion = toggleDiscussionUseful(discussion, userId);

    expect(isUsefulByUser(usefulDiscussion, userId)).toBe(true);
    expect(getUsefulCount(usefulDiscussion)).toBe(basePostUsefulCount + 1);
    expect(getUsefulCount(discussion)).toBe(basePostUsefulCount);

    const unmarkedDiscussion = toggleDiscussionUseful(usefulDiscussion, userId);

    expect(isUsefulByUser(unmarkedDiscussion, userId)).toBe(false);
    expect(getUsefulCount(unmarkedDiscussion)).toBe(basePostUsefulCount);

    const usefulCommentDiscussion = toggleCommentUseful(discussion, discussion.replies[0].id, userId);

    expect(isUsefulByUser(usefulCommentDiscussion.replies[0], userId)).toBe(true);
    expect(getUsefulCount(usefulCommentDiscussion.replies[0])).toBe(baseCommentUsefulCount + 1);
    expect(getUsefulCount(discussion.replies[0])).toBe(baseCommentUsefulCount);
  });

  it("toggles unuseful votes and keeps useful/unuseful mutually exclusive", () => {
    const discussion = FORUM_DISCUSSIONS[0];
    const userId = "user-1";
    const basePostUsefulCount = getUsefulCount(discussion);
    const basePostUnusefulCount = getUnusefulCount(discussion);
    const baseCommentUnusefulCount = getUnusefulCount(discussion.replies[0]);

    const unusefulDiscussion = toggleDiscussionUnuseful(discussion, userId);

    expect(isUnusefulByUser(unusefulDiscussion, userId)).toBe(true);
    expect(getUnusefulCount(unusefulDiscussion)).toBe(basePostUnusefulCount + 1);

    const usefulDiscussion = toggleDiscussionUseful(unusefulDiscussion, userId);

    expect(isUsefulByUser(usefulDiscussion, userId)).toBe(true);
    expect(isUnusefulByUser(usefulDiscussion, userId)).toBe(false);
    expect(getUsefulCount(usefulDiscussion)).toBe(basePostUsefulCount + 1);
    expect(getUnusefulCount(usefulDiscussion)).toBe(basePostUnusefulCount);

    const unusefulCommentDiscussion = toggleCommentUnuseful(discussion, discussion.replies[0].id, userId);

    expect(isUnusefulByUser(unusefulCommentDiscussion.replies[0], userId)).toBe(true);
    expect(getUnusefulCount(unusefulCommentDiscussion.replies[0])).toBe(baseCommentUnusefulCount + 1);
  });

  it("covers expanded forum topics in data and filters", () => {
    expect(FORUM_TOPICS.map((topic) => topic.id)).toEqual([
      "All Topics",
      "Banking",
      "Housing",
      "Jobs",
      "Health",
      "Transportation",
      "Education",
      "Legal / Immigration",
    ]);

    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "", "Transportation").map((post) => post.id)).toEqual([
      "post-5",
    ]);
    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "", "Education").map((post) => post.id)).toEqual(["post-6"]);
    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "green card", "Legal / Immigration").map((post) => post.id)).toEqual([
      "post-7",
    ]);
  });

  it("uses real forum outline content instead of placeholder copy", () => {
    for (const discussion of FORUM_DISCUSSIONS) {
      expect(discussion.title).not.toMatch(/placeholder/i);
      expect(discussion.excerpt).not.toMatch(/placeholder/i);
      expect(discussion.body.join(" ")).not.toMatch(/placeholder/i);
      expect(discussion.body.length).toBeGreaterThanOrEqual(3);
      expect(discussion.replies.length).toBeGreaterThanOrEqual(2);

      for (const reply of discussion.replies) {
        expect(reply.body).not.toMatch(/placeholder/i);
      }
    }
  });
});
