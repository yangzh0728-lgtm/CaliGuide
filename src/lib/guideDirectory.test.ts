import { describe, expect, it } from "bun:test";
import { getGuideDirectoryArticles, GUIDE_DIRECTORY_GROUPS } from "./guideDirectory";

describe("guide directory", () => {
  it("returns every published guide exactly once", () => {
    const guides = getGuideDirectoryArticles("en", "all", "");

    expect(guides).toHaveLength(20);
    expect(new Set(guides.map(({ id }) => id)).size).toBe(20);
    expect(guides.map(({ id }) => id)).toContain("forum-first-30-days");
    expect(guides.map(({ id }) => id)).toContain("category-dmv");
    expect(guides.map(({ id }) => id)).toContain("trending-ssn");
  });

  it("groups every guide under a browsable topic", () => {
    const groupedIds = GUIDE_DIRECTORY_GROUPS.flatMap(({ id }) =>
      getGuideDirectoryArticles("en", id, "").map((guide) => guide.id),
    );

    expect(groupedIds).toHaveLength(20);
    expect(new Set(groupedIds).size).toBe(20);
    expect(getGuideDirectoryArticles("en", "community", "")).toHaveLength(3);
  });

  it("searches localized guide content inside the active topic", () => {
    expect(getGuideDirectoryArticles("es", "all", "California").length).toBeGreaterThan(0);
    expect(getGuideDirectoryArticles("en", "safety", "earthquake").map(({ id }) => id)).toEqual([
      "guide-earthquake-wildfire-preparedness",
    ]);
    expect(getGuideDirectoryArticles("en", "health", "earthquake")).toEqual([]);
  });
});
