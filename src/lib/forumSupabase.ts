import { ForumDiscussion } from "./forumContent";

export type ForumVoteType = "useful" | "unuseful";
export type ForumVoteTargetType = "post" | "comment";

export interface ForumPostRow {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  category: string;
  title: string;
  excerpt: string;
  body: string[];
  tags: string[];
  image_urls?: string[];
  view_count: number;
  created_at: string;
  comments?: ForumCommentRow[];
  votes?: ForumVoteRow[];
  comment_votes?: ForumVoteRow[];
}

export interface ForumCommentRow {
  id: string;
  post_id: string;
  user_id: string;
  author_name: string;
  author_avatar: string;
  body: string;
  created_at: string;
}

export interface ForumVoteRow {
  user_id: string;
  vote_type: ForumVoteType;
  target_type: ForumVoteTargetType;
  target_id: string;
}

type SupabaseLike = {
  from: (table: string) => any;
};

export function mapForumPostRows(rows: ForumPostRow[]): ForumDiscussion[] {
  return rows.map((row) => {
    const comments = [...(row.comments ?? [])].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
    const postVotes = row.votes ?? [];
    const commentVotes = row.comment_votes ?? [];

    return {
      id: row.id,
      userId: row.user_id,
      author: row.author_name,
      avatar: row.author_avatar,
      time: formatRelativeTime(row.created_at),
      category: row.category,
      title: row.title,
      excerpt: row.excerpt,
      comments: comments.length,
      views: formatViewCount(row.view_count),
      tags: row.tags ?? [],
      imageUrls: row.image_urls ?? [],
      body: row.body ?? [],
      replies: comments.map((comment) => {
        const votes = commentVotes.filter((vote) => vote.target_id === comment.id);

        return {
          id: comment.id,
          userId: comment.user_id,
          author: comment.author_name,
          avatar: comment.author_avatar,
          time: formatRelativeTime(comment.created_at),
          body: comment.body,
          usefulUserIds: votes
            .filter((vote) => vote.vote_type === "useful")
            .map((vote) => vote.user_id),
          unusefulUserIds: votes
            .filter((vote) => vote.vote_type === "unuseful")
            .map((vote) => vote.user_id),
        };
      }),
      usefulUserIds: postVotes
        .filter((vote) => vote.vote_type === "useful")
        .map((vote) => vote.user_id),
      unusefulUserIds: postVotes
        .filter((vote) => vote.vote_type === "unuseful")
        .map((vote) => vote.user_id),
    };
  });
}

export async function fetchForumDiscussionsFromSupabase(client: SupabaseLike) {
  const { data: posts, error: postsError } = await client
    .from("forum_posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (postsError) {
    throw new Error(postsError.message);
  }

  const postRows = (posts ?? []) as ForumPostRow[];
  const postIds = postRows.map((post) => post.id);

  if (!postIds.length) {
    return [];
  }

  const [commentsResult, votesResult] = await Promise.all([
    client.from("forum_comments").select("*").in("post_id", postIds),
    client.from("forum_votes").select("*").in("target_id", postIds),
  ]);

  const commentRows = commentsResult.error ? [] : ((commentsResult.data ?? []) as ForumCommentRow[]);
  const commentIds = commentRows.map((comment) => comment.id);
  const postVotes = (votesResult.error ? [] : ((votesResult.data ?? []) as ForumVoteRow[])).filter(
    (vote) => vote.target_type === "post",
  );
  let commentVotes: ForumVoteRow[] = [];

  if (commentIds.length) {
    const { data, error } = await client
      .from("forum_votes")
      .select("*")
      .in("target_id", commentIds);

    if (!error) {
      commentVotes = ((data ?? []) as ForumVoteRow[]).filter((vote) => vote.target_type === "comment");
    }
  }

  return mapForumPostRows(
    postRows.map((post) => ({
      ...post,
      comments: commentRows.filter((comment) => comment.post_id === post.id),
      votes: postVotes.filter((vote) => vote.target_id === post.id),
      comment_votes: commentVotes,
    })),
  );
}

export function buildForumPostInsert(input: {
  id?: string;
  userId: string;
  author: string;
  avatar: string;
  category: string;
  title: string;
  body: string;
  imageUrls?: string[];
}) {
  const body = input.body.trim();

  return {
    ...(input.id ? { id: input.id } : {}),
    user_id: input.userId,
    author_id: input.userId,
    author_name: input.author.trim() || "CaliGuide Member",
    author_avatar: input.avatar.trim() || createInitials(input.author),
    category: input.category,
    title: input.title.trim(),
    excerpt: body,
    body: [
      body,
      "Community members can help more when the post includes the city, timeline, documents already prepared, and the specific decision or next step that needs advice.",
    ],
    tags: [input.category, "Community", "New Post"],
    image_urls: input.imageUrls ?? [],
  };
}

export async function createForumPostInSupabase(
  client: SupabaseLike,
  input: Parameters<typeof buildForumPostInsert>[0],
) {
  const { data, error } = await client
    .from("forum_posts")
    .insert(buildForumPostInsert(input))
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapForumPostRows([{ ...(data as ForumPostRow), comments: [], votes: [], comment_votes: [] }])[0];
}

export function buildForumCommentInsert(input: {
  postId: string;
  userId: string;
  author: string;
  avatar: string;
  body: string;
}) {
  return {
    post_id: input.postId,
    user_id: input.userId,
    author_id: input.userId,
    author_name: input.author.trim() || "CaliGuide Member",
    author_avatar: input.avatar.trim() || createInitials(input.author),
    body: input.body.trim(),
  };
}

export async function createForumCommentInSupabase(
  client: SupabaseLike,
  input: Parameters<typeof buildForumCommentInsert>[0],
) {
  const { error } = await client.from("forum_comments").insert(buildForumCommentInsert(input));

  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteForumPostInSupabase(client: SupabaseLike, postId: string) {
  const { data, error } = await client.from("forum_posts").delete().eq("id", postId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Forum post was not deleted. Please refresh and try again.");
  }
}

export async function deleteForumCommentInSupabase(client: SupabaseLike, commentId: string) {
  const { data, error } = await client.from("forum_comments").delete().eq("id", commentId).select("id").maybeSingle();

  if (error) {
    throw new Error(error.message);
  }
  if (!data) {
    throw new Error("Forum comment was not deleted. Please refresh and try again.");
  }
}

export function buildForumVoteUpsert(
  targetType: ForumVoteTargetType,
  targetId: string,
  userId: string,
  voteType: ForumVoteType,
) {
  return {
    target_type: targetType,
    target_id: targetId,
    user_id: userId,
    author_id: userId,
    vote_type: voteType,
  };
}

export async function setForumVoteInSupabase(
  client: SupabaseLike,
  targetType: ForumVoteTargetType,
  targetId: string,
  userId: string,
  voteType: ForumVoteType | null,
) {
  const table = client
    .from("forum_votes");

  const query = table
    .delete()
    .eq("target_type", targetType)
    .eq("target_id", targetId)
    .eq("user_id", userId);

  const { error: deleteError } = await query;
  if (deleteError) {
    throw new Error(deleteError.message);
  }

  if (!voteType) {
    return;
  }

  const { error: insertError } = await client
    .from("forum_votes")
    .insert(buildForumVoteUpsert(targetType, targetId, userId, voteType));

  if (insertError) {
    throw new Error(insertError.message);
  }
}

function createInitials(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function formatRelativeTime(value: string) {
  const createdAt = new Date(value).getTime();
  if (Number.isNaN(createdAt)) {
    return "Just now";
  }

  const diffMs = Date.now() - createdAt;
  const diffMinutes = Math.max(0, Math.floor(diffMs / 60000));
  if (diffMinutes < 1) {
    return "Just now";
  }
  if (diffMinutes < 60) {
    return `${diffMinutes} min ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  return `${Math.floor(diffHours / 24)} days ago`;
}

function formatViewCount(count: number) {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  }

  return String(count ?? 0);
}
