import { describe, expect, test } from "bun:test";
import { BLOG_ARTICLES } from "./blogContent";
import { GUIDE_REFERENCE_LIBRARY } from "./guideCitations";
import {
  INSTITUTIONS,
  INSTITUTION_GROUPS,
  getInstitution,
  getLocalizedInstitution,
  getRelatedGuideIds,
  searchInstitutions,
} from "./institutions";
import { LANGUAGES } from "../i18n/translations";

describe("institution directory", () => {
  test("defines one stable entry for every cited institution", () => {
    expect(INSTITUTIONS).toHaveLength(27);
    expect(new Set(INSTITUTIONS.map((institution) => institution.id)).size).toBe(27);

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
      if (institution.scamNote) {
        expect(institution.scamNote.length).toBeGreaterThan(20);
      }
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
    expect(searchInstitutions("driver license", "en")[0]?.id).toBe("ca-dmv");
    expect(searchInstitutions("mail forwarding", "en").map(({ id }) => id)).toContain("usps");
    expect(searchInstitutions("irs.gov", "en")[0]?.id).toBe("irs");
    expect(searchInstitutions("does not issue social security numbers", "en").map(({ id }) => id)).toContain(
      "ca-dmv",
    );
  });

  test("organizes agencies with stable priority and review metadata", () => {
    expect(INSTITUTION_GROUPS.some(({ id }) => id === "identity-transportation")).toBe(true);
    expect(INSTITUTION_GROUPS.some(({ id }) => id === "identity-driving")).toBe(false);

    for (const group of INSTITUTION_GROUPS) {
      const priorities = INSTITUTIONS.filter(({ groupId }) => groupId === group.id).map(
        ({ priority }) => priority,
      );
      expect(priorities.length).toBeGreaterThan(0);
      expect(new Set(priorities).size).toBe(priorities.length);
    }

    for (const institution of INSTITUTIONS) {
      expect(institution.lastReviewedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }

    expect(INSTITUTIONS.filter(({ scamNote }) => Boolean(scamNote)).length).toBeLessThan(10);
  });

  test("provides localized orientation content in every supported language", () => {
    for (const institution of INSTITUTIONS) {
      for (const { code } of LANGUAGES) {
        const localized = getLocalizedInstitution(institution.id, code);
        expect(localized?.officialName).toBe(institution.officialName);
        expect(localized?.purpose.length).toBeGreaterThan(20);
        expect(localized?.doesNotDo.length).toBeGreaterThan(20);
        expect(localized?.languageAccessNote.length).toBeGreaterThan(15);
      }
    }
  });

  test("resolves compact confusion guidance to real agencies", () => {
    const ids = new Set(INSTITUTIONS.map(({ id }) => id));
    expect(INSTITUTIONS.some(({ confusionPairs }) => confusionPairs.length > 0)).toBe(true);

    for (const institution of INSTITUTIONS) {
      for (const pair of institution.confusionPairs) {
        expect(ids.has(pair.targetInstitutionId)).toBe(true);
        for (const { code } of LANGUAGES) {
          expect(pair.content[code].trigger.length).toBeGreaterThan(5);
          expect(pair.content[code].explanation.length).toBeGreaterThan(10);
        }
      }
    }
  });

  test("searches the active localized agency content", () => {
    expect(searchInstitutions("驾照", "zh-CN").map(({ id }) => id)).toContain("ca-dmv");
    expect(searchInstitutions("autorización de empleo", "es").map(({ id }) => id)).toContain(
      "uscis",
    );
  });
});
