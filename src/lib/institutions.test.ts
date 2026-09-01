import { describe, expect, test } from "bun:test";
import { BLOG_ARTICLES } from "./blogContent";
import { GUIDE_REFERENCE_LIBRARY } from "./guideCitations";
import {
  INSTITUTIONS,
  INSTITUTION_GROUPS,
  getInstitution,
  getRelatedGuideIds,
  searchInstitutions,
} from "./institutions";

describe("institution directory", () => {
  test("defines one stable entry for every cited institution", () => {
    expect(INSTITUTIONS).toHaveLength(26);
    expect(new Set(INSTITUTIONS.map((institution) => institution.id)).size).toBe(26);

    for (const referenceItem of Object.values(GUIDE_REFERENCE_LIBRARY)) {
      const institution = getInstitution(referenceItem.institutionId);
      expect(institution).toBeDefined();
      expect(institution?.publisherNames).toContain(referenceItem.publisher);
    }
  });

  test("provides complete, official directory information", () => {
    const validGroups = new Set(INSTITUTION_GROUPS.map((group) => group.id));

    for (const institution of INSTITUTIONS) {
      expect(institution.name.length).toBeGreaterThan(2);
      expect(institution.purpose.length).toBeGreaterThan(20);
      expect(institution.doesNotDo.length).toBeGreaterThan(20);
      expect(institution.scamNote.length).toBeGreaterThan(20);
      expect(institution.officialUrl.startsWith("https://")).toBe(true);
      expect(institution.officialDomain).toBe(new URL(institution.officialUrl).hostname);
      expect(validGroups.has(institution.groupId)).toBe(true);
    }
  });

  test("derives related guides from citations without storing duplicate guide lists", () => {
    const validGuideIds = new Set(BLOG_ARTICLES.map((article) => article.id));
    const dmvGuideIds = getRelatedGuideIds("ca-dmv");

    expect(dmvGuideIds.length).toBeGreaterThan(0);
    expect(dmvGuideIds).toContain("guide-1");
    for (const guideId of dmvGuideIds) {
      expect(validGuideIds.has(guideId)).toBe(true);
    }
  });

  test("searches names, domains, purpose, and agency boundaries", () => {
    expect(searchInstitutions("driver license")[0]?.id).toBe("ca-dmv");
    expect(searchInstitutions("irs.gov")[0]?.id).toBe("irs");
    expect(searchInstitutions("does not issue social security numbers").map(({ id }) => id)).toContain(
      "ca-dmv",
    );
  });
});
