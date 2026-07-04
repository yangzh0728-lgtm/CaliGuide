import { describe, expect, it } from "bun:test";
import { getVisibleRecommendedGuides } from "./homeRecommendations";

describe("homeRecommendations", () => {
  it("shows a preview by default and all guides after see all", () => {
    const guides = [
      { id: "guide-1" },
      { id: "guide-2" },
      { id: "guide-3" },
      { id: "guide-4" },
    ];

    expect(getVisibleRecommendedGuides(guides, false).map((guide) => guide.id)).toEqual([
      "guide-1",
      "guide-2",
      "guide-3",
    ]);
    expect(getVisibleRecommendedGuides(guides, true).map((guide) => guide.id)).toEqual([
      "guide-1",
      "guide-2",
      "guide-3",
      "guide-4",
    ]);
  });
});
