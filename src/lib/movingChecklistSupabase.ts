import {
  normalizeMovingChecklistTaskIds,
  type MovingChecklistTaskId,
} from "./movingChecklist";

type SupabaseLike = {
  from: (table: string) => any;
};

export async function loadMovingChecklistProgress(
  client: SupabaseLike,
  userId: string,
): Promise<MovingChecklistTaskId[]> {
  const { data, error } = await client
    .from("moving_checklist_progress")
    .select("completed_task_ids")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return normalizeMovingChecklistTaskIds(data?.completed_task_ids);
}

export async function saveMovingChecklistProgress(
  client: SupabaseLike,
  userId: string,
  completedTaskIds: MovingChecklistTaskId[],
) {
  const { error } = await client.from("moving_checklist_progress").upsert(
    {
      user_id: userId,
      completed_task_ids: normalizeMovingChecklistTaskIds(completedTaskIds),
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error(error.message);
  }
}

export function mergeMovingChecklistProgress(
  accountProgress: MovingChecklistTaskId[],
  browserProgress: MovingChecklistTaskId[],
) {
  return normalizeMovingChecklistTaskIds([...accountProgress, ...browserProgress]);
}
