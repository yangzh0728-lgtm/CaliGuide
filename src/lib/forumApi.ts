import { SupabaseClient } from "@supabase/supabase-js";
import {
  buildForumCommentInsert,
  buildForumPostInsert,
  createForumPostInSupabase,
  buildForumVoteUpsert,
  deleteForumCommentInSupabase,
  deleteForumPostInSupabase,
  ForumVoteTargetType,
  ForumVoteType,
  mapForumPostRows,
  type ForumPostRow,
} from "./forumSupabase";
import { resolveApiUrl } from "./apiUrl";
import { isSupabaseUuid } from "./uuid";

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
  const response = await fetch(resolveApiUrl(path), {
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
  try {
    const payload = await postForumJson<{ post: ForumPostRow }>(client, "/api/forum/posts", input);
    return mapForumPostRows([{ ...payload.post, comments: [], votes: [], comment_votes: [] }])[0];
  } catch (error) {
    if (isMissingForumPostRoute(error) && hasSupabaseTableClient(client)) {
      return createForumPostInSupabase(client, input);
    }

    throw error;
  }
}

export async function createForumCommentViaApi(
  client: SupabaseSessionClient,
  input: Parameters<typeof buildForumCommentInsert>[0],
) {
  await postForumJson<{ ok: true }>(client, "/api/forum/comments", input);
}

export async function deleteForumPostViaApi(client: SupabaseSessionClient, postId: string) {
  try {
    await postForumJson<{ ok: true }>(client, "/api/forum/posts/delete", { postId });
  } catch (error) {
    if (isMissingForumDeleteRoute(error) && hasSupabaseTableClient(client)) {
      await deleteForumPostInSupabase(client, postId);
      return;
    }

    throw error;
  }
}

export async function deleteForumCommentViaApi(client: SupabaseSessionClient, commentId: string) {
  try {
    await postForumJson<{ ok: true }>(client, "/api/forum/comments/delete", { commentId });
  } catch (error) {
    if (isMissingForumDeleteRoute(error) && hasSupabaseTableClient(client)) {
      await deleteForumCommentInSupabase(client, commentId);
      return;
    }

    throw error;
  }
}

export async function setForumVoteViaApi(
  client: SupabaseSessionClient,
  targetType: ForumVoteTargetType,
  targetId: string,
  userId: string,
  voteType: ForumVoteType | null,
) {
  if (!isSupabaseUuid(targetId)) {
    return;
  }

  await postForumJson<{ ok: true }>(client, "/api/forum/votes", {
    ...buildForumVoteUpsert(targetType, targetId, userId, voteType ?? "useful"),
    vote_type: voteType,
  });
}

function isMissingForumDeleteRoute(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Forum sync failed with HTTP 404") &&
    (error.message.includes("Cannot POST /api/forum/posts/delete") ||
      error.message.includes("Cannot POST /api/forum/comments/delete"))
  );
}

function isMissingForumPostRoute(error: unknown) {
  if (!(error instanceof Error)) {
    return false;
  }

  return (
    error.message.includes("Forum sync failed with HTTP 404") &&
    error.message.includes("Cannot POST /api/forum/posts")
  );
}

function hasSupabaseTableClient(client: SupabaseSessionClient): client is SupabaseClient {
  return typeof (client as SupabaseClient).from === "function";
}
