export interface ProfileRecentChat {
  id: string;
  title: string;
  updatedAt: string;
}

type SupabaseLike = {
  from: (table: string) => any;
};

export async function fetchRecentProfileChats(
  client: SupabaseLike,
  userId: string,
  limitCount = 2,
): Promise<ProfileRecentChat[]> {
  const { data, error } = await client
    .from("chat_sessions")
    .select("id,title,updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .limit(limitCount);

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? [])
    .filter(
      (row: unknown): row is { id: string; title: string; updated_at: string } =>
        Boolean(
          row &&
          typeof row === "object" &&
          typeof (row as Record<string, unknown>).id === "string" &&
          typeof (row as Record<string, unknown>).title === "string" &&
          typeof (row as Record<string, unknown>).updated_at === "string",
        ),
    )
    .map((row: { id: string; title: string; updated_at: string }) => ({
      id: row.id,
      title: row.title,
      updatedAt: row.updated_at,
    }));
}
