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
  mergeForumDiscussions,
  removeForumComment,
  removeForumDiscussion,
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

    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "district boundary lookup", "All Topics").map((post) => post.id)).toEqual([
      "post-1",
    ]);

    expect(filterForumDiscussions(FORUM_DISCUSSIONS, "printed copies", "All Topics").map((post) => post.id)).toEqual([
      "post-2",
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
      userId: "user-2",
      author: "Maya Chen",
      body: "This is a helpful answer from the forum.",
    });

    expect(discussion.replies).toHaveLength(0);
    expect(updated.replies).toHaveLength(1);
    expect(updated.replies[0].id).toMatch(/^[0-9a-f-]{36}$/);
    expect(updated.replies[0].author).toBe("Maya Chen");
    expect(updated.replies[0].userId).toBe("user-2");
    expect(updated.replies[0].avatar).toBe("MC");
    expect(updated.replies[0].body).toBe("This is a helpful answer from the forum.");
    expect(getForumReplyCount(updated)).toBe(1);
  });

  it("removes only posts and comments owned by the current user", () => {
    const ownDiscussion = createForumDiscussion({
      id: "11111111-1111-4111-8111-111111111111",
      title: "My post",
      category: "Housing",
      body: "My post body",
      author: "Sam Y",
      userId: "user-1",
    });
    const otherDiscussion = createForumDiscussion({
      id: "22222222-2222-4222-8222-222222222222",
      title: "Other post",
      category: "Banking",
      body: "Other post body",
      author: "Other User",
      userId: "user-2",
    });

    expect(removeForumDiscussion([ownDiscussion, otherDiscussion], ownDiscussion.id, "user-1")).toEqual([
      otherDiscussion,
    ]);
    expect(removeForumDiscussion([ownDiscussion, otherDiscussion], otherDiscussion.id, "user-1")).toEqual([
      ownDiscussion,
      otherDiscussion,
    ]);

    const withComment = addForumComment(ownDiscussion, {
      userId: "user-1",
      author: "Sam Y",
      body: "My comment",
    });
    const notRemoved = removeForumComment(withComment, withComment.replies[0].id, "user-2");
    const removed = removeForumComment(withComment, withComment.replies[0].id, "user-1");

    expect(notRemoved.replies).toHaveLength(1);
    expect(removed.replies).toHaveLength(0);
  });

  it("keeps original mock posts when remote forum posts are loaded", () => {
    const remoteDiscussion = createForumDiscussion({
      id: "33333333-3333-4333-8333-333333333333",
      title: "Remote post",
      category: "Housing",
      body: "Remote post body",
      author: "Remote User",
      userId: "user-3",
    });

    const merged = mergeForumDiscussions(FORUM_DISCUSSIONS, [remoteDiscussion]);

    expect(merged[0].id).toBe(remoteDiscussion.id);
    expect(merged.map((discussion) => discussion.id)).toContain("post-1");
    expect(merged.map((discussion) => discussion.id)).toContain("post-7");
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
