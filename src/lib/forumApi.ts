import { SupabaseClient } from "@supabase/supabase-js";
import {
  buildForumCommentInsert,
  buildForumPostInsert,
  buildForumVoteUpsert,
  ForumVoteTargetType,
  ForumVoteType,
  mapForumPostRows,
  type ForumPostRow,
} from "./forumSupabase";

type SupabaseSessionClient = SupabaseClient | {
  auth: {
    getSession: () => Promise<{ data: { session: { access_token: string } | null }; error: { message: string } | null }>;
  };
};

async function getAccessToken(client: SupabaseSessionClient) {
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }
  if (!data.session?.access_token) {
    throw new Error("Sign in required");
  }

  return data.session.access_token;
}

async function postForumJson<TResponse>(
  client: SupabaseSessionClient,
  path: string,
  body: Record<string, unknown>,
): Promise<TResponse> {
  const accessToken = await getAccessToken(client);
  const response = await fetch(path, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const responseText = await response.text();
  const payload = parseJsonObject(responseText);

  if (!response.ok) {
    if (typeof payload.error === "string") {
      throw new Error(payload.error);
    }

    const detail = responseText.trim();
    throw new Error(
      detail
        ? `Forum sync failed with HTTP ${response.status}: ${detail}`
        : `Forum sync failed with HTTP ${response.status}`,
    );
  }

  return payload as TResponse;
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export async function createForumPostViaApi(
  client: SupabaseSessionClient,
  input: Parameters<typeof buildForumPostInsert>[0],
) {
  const payload = await postForumJson<{ post: ForumPostRow }>(client, "/api/forum/posts", input);
  return mapForumPostRows([{ ...payload.post, comments: [], votes: [], comment_votes: [] }])[0];
}

export async function createForumCommentViaApi(
  client: SupabaseSessionClient,
  input: Parameters<typeof buildForumCommentInsert>[0],
) {
  await postForumJson<{ ok: true }>(client, "/api/forum/comments", input);
}

export async function deleteForumPostViaApi(client: SupabaseSessionClient, postId: string) {
  await postForumJson<{ ok: true }>(client, "/api/forum/posts/delete", { postId });
}

export async function deleteForumCommentViaApi(client: SupabaseSessionClient, commentId: string) {
  await postForumJson<{ ok: true }>(client, "/api/forum/comments/delete", { commentId });
}

export async function setForumVoteViaApi(
  client: SupabaseSessionClient,
  targetType: ForumVoteTargetType,
  targetId: string,
  userId: string,
  voteType: ForumVoteType | null,
) {
  await postForumJson<{ ok: true }>(client, "/api/forum/votes", {
    ...buildForumVoteUpsert(targetType, targetId, userId, voteType ?? "useful"),
    vote_type: voteType,
  });
}
