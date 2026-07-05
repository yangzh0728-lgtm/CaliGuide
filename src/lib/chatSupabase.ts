import { ChatMessage } from "../types";
import { ChatUserMemory } from "./chatMemory";

export interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
  messages?: ChatMessageRow[];
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  user_id: string;
  role: "user" | "bot";
  content: string;
  image_urls?: string[];
  created_at: string;
}

type SupabaseLike = {
  from: (table: string) => any;
};

export function mapChatSessionRows(
  rows: ChatSessionRow[],
  introMessage: ChatMessage,
): ChatUserMemory {
  const sessions = rows.map((row) => {
    const messages = [...(row.messages ?? [])]
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((message) => ({
        role: message.role,
        content: message.content,
        timestamp: formatChatTimestamp(message.created_at),
        ...(message.image_urls?.length ? { imageUrls: message.image_urls } : {}),
      }));

    return {
      id: row.id,
      title: row.title || createSessionTitle(messages),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messages: messages.length ? messages : [introMessage],
    };
  });
  const sortedSessions = sessions.sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  );
  const activeSession = sortedSessions[0] ?? {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [introMessage],
  };

  return {
    activeSessionId: activeSession.id,
    sessions: sortedSessions.length ? sortedSessions : [activeSession],
    messages: activeSession.messages,
  };
}

export async function fetchChatUserMemoryFromSupabase(
  client: SupabaseLike,
  userId: string,
  introMessage: ChatMessage,
) {
  const { data: sessions, error: sessionsError } = await client
    .from("chat_sessions")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (sessionsError) {
    throw new Error(sessionsError.message);
  }

  const sessionRows = (sessions ?? []) as ChatSessionRow[];
  const sessionIds = sessionRows.map((session) => session.id);

  if (!sessionIds.length) {
    return mapChatSessionRows([], introMessage);
  }

  const { data: messages, error: messagesError } = await client
    .from("chat_messages")
    .select("*")
    .in("session_id", sessionIds)
    .order("created_at", { ascending: true });

  if (messagesError) {
    throw new Error(messagesError.message);
  }

  const messageRows = (messages ?? []) as ChatMessageRow[];
  return mapChatSessionRows(
    sessionRows.map((session) => ({
      ...session,
      messages: messageRows.filter((message) => message.session_id === session.id),
    })),
    introMessage,
  );
}

export function buildChatSessionUpsert(id: string, userId: string, title: string) {
  return {
    id,
    user_id: userId,
    title: title.trim() || "New chat",
    updated_at: new Date().toISOString(),
  };
}

export async function upsertChatSessionInSupabase(
  client: SupabaseLike,
  input: { id: string; userId: string; title: string },
) {
  const { error } = await client
    .from("chat_sessions")
    .upsert(buildChatSessionUpsert(input.id, input.userId, input.title), { onConflict: "id" });

  if (error) {
    throw new Error(error.message);
  }
}

export function buildChatMessageInserts(
  sessionId: string,
  userId: string,
  messages: ChatMessage[],
) {
  return messages
    .filter((message) => message.content.trim())
    .map((message) => ({
      session_id: sessionId,
      user_id: userId,
      role: message.role,
      content: message.content.trim(),
      image_urls: message.imageUrls ?? [],
    }));
}

export async function appendChatMessagesToSupabase(
  client: SupabaseLike,
  input: { sessionId: string; userId: string; title: string; messages: ChatMessage[] },
) {
  await upsertChatSessionInSupabase(client, {
    id: input.sessionId,
    userId: input.userId,
    title: input.title,
  });

  const inserts = buildChatMessageInserts(input.sessionId, input.userId, input.messages);
  if (!inserts.length) {
    return;
  }

  const { error } = await client.from("chat_messages").insert(inserts);
  if (error) {
    throw new Error(error.message);
  }
}

export async function deleteChatSessionFromSupabase(
  client: SupabaseLike,
  sessionId: string,
  userId: string,
) {
  const { error } = await client
    .from("chat_sessions")
    .delete()
    .eq("id", sessionId)
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }
}

function formatChatTimestamp(value: string) {
  return new Date(value).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function createSessionTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user" && message.content.trim());
  return firstUserMessage?.content.trim().slice(0, 42) || "New chat";
}
