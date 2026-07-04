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

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(typeof payload.error === "string" ? payload.error : "Unable to sync forum data");
  }

  return payload as TResponse;
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
