import { ChatMessage } from "../types";

export const CHAT_MEMORY_STORAGE_KEY = "caliguide-chat-memory";
export const DEFAULT_CHAT_USER_ID = "guest";

export interface ChatSessionMemory {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
}

export interface ChatUserMemory {
  activeSessionId: string;
  sessions: ChatSessionMemory[];
  messages: ChatMessage[];
}

export interface ChatMemoryState {
  sessionsByUserId: Record<string, ChatUserMemory>;
}

export function createChatMemoryState(): ChatMemoryState {
  return {
    sessionsByUserId: {},
  };
}

export function loadChatMemoryState(storage: Storage): ChatMemoryState {
  const rawState = storage.getItem(CHAT_MEMORY_STORAGE_KEY);
  if (!rawState) {
    return createChatMemoryState();
  }

  try {
    const parsed = JSON.parse(rawState) as ChatMemoryState;
    if (!parsed || typeof parsed !== "object" || !parsed.sessionsByUserId) {
      return createChatMemoryState();
    }

    return {
      sessionsByUserId: Object.fromEntries(
        Object.entries(parsed.sessionsByUserId).map(([userId, memory]) => [
          userId,
          hydrateUserMemory(memory),
        ]),
      ),
    };
  } catch {
    return createChatMemoryState();
  }
}

export function saveChatMemoryState(storage: Storage, state: ChatMemoryState) {
  storage.setItem(CHAT_MEMORY_STORAGE_KEY, JSON.stringify(state));
}

export function getChatUserMemory(
  state: ChatMemoryState,
  userId: string,
  introMessage: ChatMessage,
): ChatUserMemory {
  return state.sessionsByUserId[userId] ?? createChatUserMemory(introMessage);
}

export function ensureChatMemoryForUser(
  state: ChatMemoryState,
  userId: string,
  introMessage: ChatMessage,
): ChatMemoryState {
  if (state.sessionsByUserId[userId]) {
    return state;
  }

  return {
    sessionsByUserId: {
      ...state.sessionsByUserId,
      [userId]: createChatUserMemory(introMessage),
    },
  };
}

export function appendChatMemoryMessages(
  state: ChatMemoryState,
  userId: string,
  messages: ChatMessage[],
): ChatMemoryState {
  const now = new Date().toISOString();
  const currentMemory = state.sessionsByUserId[userId] ?? createChatUserMemory();
  const activeSession = getActiveSession(currentMemory);
  const nextMessages = [...activeSession.messages, ...messages];
  const nextSession = {
    ...activeSession,
    title: createSessionTitle(nextMessages),
    updatedAt: now,
    messages: nextMessages,
  };

  return updateUserMemory(state, userId, {
    ...currentMemory,
    sessions: replaceSession(currentMemory.sessions, nextSession),
    messages: nextMessages,
  });
}

export function replaceLastChatMemoryMessage(
  state: ChatMemoryState,
  userId: string,
  message: ChatMessage,
): ChatMemoryState {
  const currentMemory = state.sessionsByUserId[userId] ?? createChatUserMemory();
  const activeSession = getActiveSession(currentMemory);
  const nextMessages = activeSession.messages.map((currentMessage, index) =>
    index === activeSession.messages.length - 1 ? message : currentMessage,
  );
  const nextSession = {
    ...activeSession,
    updatedAt: new Date().toISOString(),
    messages: nextMessages,
  };

  return updateUserMemory(state, userId, {
    ...currentMemory,
    sessions: replaceSession(currentMemory.sessions, nextSession),
    messages: nextMessages,
  });
}

export function startChatMemorySession(
  state: ChatMemoryState,
  userId: string,
  introMessage: ChatMessage,
): ChatMemoryState {
  const currentMemory = state.sessionsByUserId[userId] ?? createChatUserMemory(introMessage);
  const nextSession = createChatSession(introMessage);

  return updateUserMemory(state, userId, {
    ...currentMemory,
    activeSessionId: nextSession.id,
    sessions: [nextSession, ...currentMemory.sessions],
    messages: nextSession.messages,
  });
}

export function setActiveChatMemorySession(
  state: ChatMemoryState,
  userId: string,
  sessionId: string,
): ChatMemoryState {
  const currentMemory = state.sessionsByUserId[userId];
  const session = currentMemory?.sessions.find((item) => item.id === sessionId);

  if (!currentMemory || !session) {
    return state;
  }

  return updateUserMemory(state, userId, {
    ...currentMemory,
    activeSessionId: sessionId,
    messages: session.messages,
  });
}

export function deleteChatMemorySession(
  state: ChatMemoryState,
  userId: string,
  sessionId: string,
  introMessage: ChatMessage,
): ChatMemoryState {
  const currentMemory = state.sessionsByUserId[userId];
  if (!currentMemory) {
    return state;
  }

  const remainingSessions = currentMemory.sessions.filter((session) => session.id !== sessionId);
  const nextSessions = remainingSessions.length ? remainingSessions : [createChatSession(introMessage)];
  const nextActiveSession =
    sessionId === currentMemory.activeSessionId
      ? nextSessions[0]
      : nextSessions.find((session) => session.id === currentMemory.activeSessionId) ?? nextSessions[0];

  return updateUserMemory(state, userId, {
    activeSessionId: nextActiveSession.id,
    sessions: nextSessions,
    messages: nextActiveSession.messages,
  });
}

export function toChatHistory(messages: ChatMessage[]) {
  return messages
    .filter((message) => message.content.trim())
    .filter((message, index) => index > 0 || message.role !== "bot")
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content,
      imageUrls: message.imageUrls ?? [],
    }));
}

function createChatUserMemory(introMessage?: ChatMessage): ChatUserMemory {
  const session = createChatSession(introMessage);

  return {
    activeSessionId: session.id,
    sessions: [session],
    messages: session.messages,
  };
}

function createChatSession(introMessage?: ChatMessage): ChatSessionMemory {
  const now = new Date().toISOString();

  return {
    id: crypto.randomUUID(),
    title: "New chat",
    createdAt: now,
    updatedAt: now,
    messages: introMessage ? [introMessage] : [],
  };
}

function hydrateUserMemory(memory: ChatUserMemory): ChatUserMemory {
  const sessions = Array.isArray(memory.sessions) ? memory.sessions : [];
  const fallbackSession = sessions[0] ?? createChatSession();
  const activeSession =
    sessions.find((session) => session.id === memory.activeSessionId) ?? fallbackSession;

  return {
    activeSessionId: activeSession.id,
    sessions: sessions.length ? sessions : [fallbackSession],
    messages: activeSession.messages,
  };
}

function getActiveSession(memory: ChatUserMemory) {
  return memory.sessions.find((session) => session.id === memory.activeSessionId) ?? memory.sessions[0];
}

function updateUserMemory(
  state: ChatMemoryState,
  userId: string,
  memory: ChatUserMemory,
): ChatMemoryState {
  return {
    sessionsByUserId: {
      ...state.sessionsByUserId,
      [userId]: memory,
    },
  };
}

function replaceSession(sessions: ChatSessionMemory[], nextSession: ChatSessionMemory) {
  return sessions.map((session) => (session.id === nextSession.id ? nextSession : session));
}

function createSessionTitle(messages: ChatMessage[]) {
  const firstUserMessage = messages.find((message) => message.role === "user" && message.content.trim());
  if (!firstUserMessage) {
    return "New chat";
  }

  return firstUserMessage.content.trim().slice(0, 42);
}
