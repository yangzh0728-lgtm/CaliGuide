export const MEM0_API_BASE_URL = "https://api.mem0.ai/v1";

export type Mem0Role = "user" | "assistant";

export type Mem0Message = {
  role: Mem0Role;
  content: string;
};

export type Mem0Memory = {
  memory: string;
};

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

type Mem0Options = {
  apiKey?: string;
  userId: string;
  fetcher?: Fetcher;
};

export async function searchMem0Memories({
  apiKey,
  userId,
  query,
  fetcher = fetch,
}: Mem0Options & { query: string }): Promise<Mem0Memory[]> {
  if (!apiKey || !userId.trim() || !query.trim()) {
    return [];
  }

  const response = await fetcher(`${MEM0_API_BASE_URL}/memories/search/`, {
    method: "POST",
    headers: createMem0Headers(apiKey),
    body: JSON.stringify({
      user_id: userId,
      query,
    }),
  });

  await assertMem0Response(response, "search mem0 memories");
  return normalizeMem0SearchResponse(await response.json());
}

export async function listMem0Memories({
  apiKey,
  userId,
  fetcher = fetch,
}: Mem0Options): Promise<Mem0Memory[]> {
  if (!apiKey || !userId.trim()) {
    return [];
  }

  const url = `${MEM0_API_BASE_URL}/memories/?user_id=${encodeURIComponent(userId)}&page=1&page_size=10`;
  const response = await fetcher(url, {
    method: "GET",
    headers: {
      Authorization: `Token ${apiKey}`,
    },
  });

  await assertMem0Response(response, "list mem0 memories");
  return normalizeMem0SearchResponse(await response.json());
}

export async function getRelevantMem0Memories({
  apiKey,
  userId,
  query,
  fetcher = fetch,
}: Mem0Options & { query: string }): Promise<Mem0Memory[]> {
  const [searchedMemories, listedMemories] = await Promise.all([
    searchMem0Memories({ apiKey, userId, query, fetcher }),
    listMem0Memories({ apiKey, userId, fetcher }),
  ]);

  return uniqueMemories([...searchedMemories, ...listedMemories]).slice(0, 10);
}

export async function addMem0Conversation({
  apiKey,
  userId,
  messages,
  fetcher = fetch,
}: Mem0Options & { messages: Mem0Message[] }) {
  const cleanMessages = messages.filter((message) => message.content.trim());
  if (!apiKey || !userId.trim() || cleanMessages.length === 0) {
    return;
  }

  const response = await fetcher(`${MEM0_API_BASE_URL}/memories/`, {
    method: "POST",
    headers: createMem0Headers(apiKey),
    body: JSON.stringify({
      user_id: userId,
      messages: cleanMessages,
    }),
  });

  await assertMem0Response(response, "add mem0 conversation");
}

export function buildMem0MemoryContext(memories: Mem0Memory[]) {
  const lines = memories
    .map((item) => item.memory.trim())
    .filter(Boolean)
    .slice(0, 8);

  if (!lines.length) {
    return "";
  }

  return `Relevant long-term user memory from mem0:\n${lines.map((line) => `- ${line}`).join("\n")}`;
}

function createMem0Headers(apiKey: string) {
  return {
    Authorization: `Token ${apiKey}`,
    "Content-Type": "application/json",
  };
}

async function assertMem0Response(response: Response, action: string) {
  if (response.ok) {
    return;
  }

  const details = await response.text();
  throw new Error(`Unable to ${action}: ${response.status} ${details || response.statusText}`);
}

function normalizeMem0SearchResponse(response: unknown): Mem0Memory[] {
  if (Array.isArray(response)) {
    return response.map(normalizeMem0Memory).filter(Boolean) as Mem0Memory[];
  }

  if (response && typeof response === "object" && "results" in response) {
    const results = (response as { results: unknown }).results;
    return Array.isArray(results)
      ? (results.map(normalizeMem0Memory).filter(Boolean) as Mem0Memory[])
      : [];
  }

  return [];
}

function normalizeMem0Memory(value: unknown): Mem0Memory | null {
  if (typeof value === "string") {
    return { memory: value };
  }

  if (!value || typeof value !== "object") {
    return null;
  }

  const memory = (value as { memory?: unknown; text?: unknown }).memory ?? (value as { text?: unknown }).text;
  return typeof memory === "string" ? { memory } : null;
}

function uniqueMemories(memories: Mem0Memory[]) {
  const seen = new Set<string>();
  return memories.filter((memory) => {
    const key = memory.memory.trim().toLowerCase();
    if (!key || seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
}
