import { describe, expect, it } from "bun:test";
import {
  MOVING_CHECKLIST_STORAGE_KEY,
  getMovingChecklistCopy,
  parseMovingChecklistProgress,
} from "./movingChecklist";

describe("moving checklist", () => {
  it("defines a stable optional preference storage key", () => {
    expect(MOVING_CHECKLIST_STORAGE_KEY).toBe("caliguide-moving-checklist");
  });

  it("keeps deadline tasks aligned across all interface languages", () => {
    const englishTaskIds = getMovingChecklistCopy("en").tasks.map(({ id }) => id);

    for (const language of ["zh-CN", "zh-TW", "yue", "es"] as const) {
      expect(getMovingChecklistCopy(language).tasks.map(({ id }) => id)).toEqual(englishTaskIds);
    }
  });

  it("rejects malformed progress and keeps only known completed task ids", () => {
    expect(parseMovingChecklistProgress("not json")).toEqual([]);
    expect(parseMovingChecklistProgress(JSON.stringify(["uscis", "unknown", 4]))).toEqual([
      "uscis",
    ]);
  });
});
