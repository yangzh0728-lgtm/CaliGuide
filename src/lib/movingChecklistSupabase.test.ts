import { describe, expect, it, mock } from "bun:test";
import {
  loadMovingChecklistProgress,
  mergeMovingChecklistProgress,
  saveMovingChecklistProgress,
} from "./movingChecklistSupabase";

describe("moving checklist Supabase persistence", () => {
  it("loads only known task ids from the signed-in user's row", async () => {
    const maybeSingle = mock(async () => ({
      data: { completed_task_ids: ["usps", "unknown", "dmv-license"] },
      error: null,
    }));
    const eq = mock(() => ({ maybeSingle }));
    const select = mock(() => ({ eq }));
    const client = { from: mock(() => ({ select })) };

    expect(await loadMovingChecklistProgress(client, "user-1")).toEqual(["usps", "dmv-license"]);
    expect(client.from).toHaveBeenCalledWith("moving_checklist_progress");
    expect(eq).toHaveBeenCalledWith("user_id", "user-1");
  });

  it("merges browser progress into account progress without duplicates", () => {
    expect(
      mergeMovingChecklistProgress(["usps", "uscis"], ["uscis", "utilities"]),
    ).toEqual(["usps", "uscis", "utilities"]);
  });

  it("upserts validated progress for one user", async () => {
    const upsert = mock(async () => ({ error: null }));
    const client = { from: mock(() => ({ upsert })) };

    await saveMovingChecklistProgress(client, "user-1", ["usps", "unknown" as never]);

    expect(upsert).toHaveBeenCalledWith(
      {
        user_id: "user-1",
        completed_task_ids: ["usps"],
        updated_at: expect.any(String),
      },
      { onConflict: "user_id" },
    );
  });
});
