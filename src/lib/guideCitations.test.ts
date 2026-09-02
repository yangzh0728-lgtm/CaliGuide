import { describe, expect, it } from "bun:test";
import { BLOG_ARTICLES } from "./blogContent";
import {
  GUIDE_REFERENCE_LIBRARY,
  getGuideCitationSet,
  getSectionCitationNumbers,
  getSectionActions,
  validateGuideCitationCoverage,
} from "./guideCitations";

describe("guide citations", () => {
  it("cites every body section in every live guide", () => {
    expect(validateGuideCitationCoverage(BLOG_ARTICLES)).toEqual([]);

    for (const article of BLOG_ARTICLES) {
      const citationSet = getGuideCitationSet(article.id);
      expect(citationSet).toBeDefined();
      expect(citationSet?.sectionCitationIds).toHaveLength(article.body.length);
      expect(citationSet?.sectionCitationIds.every((ids) => ids.length > 0)).toBe(true);
    }
  });

  it("uses unique stable references with secure official URLs", () => {
    for (const article of BLOG_ARTICLES) {
      const citationSet = getGuideCitationSet(article.id);
      const ids = citationSet?.references.map((reference) => reference.id) ?? [];
      const urls = citationSet?.references.map((reference) => reference.url) ?? [];

      expect(new Set(ids).size).toBe(ids.length);
      expect(new Set(urls).size).toBe(urls.length);
      expect(urls.every((url) => url.startsWith("https://"))).toBe(true);
    }
  });

  it("resolves section source IDs into one-based reference numbers", () => {
    const citationSet = getGuideCitationSet("guide-1");
    expect(citationSet).toBeDefined();

    const firstSectionNumbers = getSectionCitationNumbers(citationSet!, 0);
    expect(firstSectionNumbers.length).toBeGreaterThan(0);
    expect(firstSectionNumbers.every((number) => number >= 1)).toBe(true);
  });

  it("offers section-scoped official actions across every guide", () => {
    for (const article of BLOG_ARTICLES) {
      const citationSet = getGuideCitationSet(article.id);
      expect(citationSet).toBeDefined();

      const actions = article.body.flatMap((_, sectionIndex) =>
        getSectionActions(citationSet!, sectionIndex),
      );
      expect(actions.length).toBeGreaterThan(0);

      actions.forEach((action) => {
        expect(["apply", "book", "find", "read", "download", "verify"]).toContain(action.kind);
        expect(citationSet?.references.some((reference) => reference.id === action.referenceId)).toBe(true);
        expect(citationSet?.sectionCitationIds[action.sectionIndex]).toContain(action.referenceId);
        expect(action.url.startsWith("https://")).toBe(true);
      });
    }
  });

  it("consolidates every legacy orphaned official URL into the reference library", () => {
    const urls = new Set(
      Object.values(GUIDE_REFERENCE_LIBRARY).map((reference) => reference.url),
    );

    for (const url of [
      "https://www.dmv.ca.gov/portal/driver-handbooks/",
      "https://www.dmv.ca.gov/portal/locations/",
      "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/",
      "https://www.dmv.ca.gov/portal/uploads/2020/06/List_of_Docs_REALID.pdf",
      "https://www.irs.gov/tin/itin/how-to-apply-for-an-itin",
      "https://www.irs.gov/forms-pubs/about-form-w-7",
    ]) {
      expect(urls.has(url)).toBe(true);
    }
  });

  it("records the verification date for the moving guide's new official sources", () => {
    for (const id of [
      "ssa-address-change",
      "usps-address-change",
      "dmv-address-change",
      "california-voter-address",
      "irs-address-change",
      "ca-insurance-garaging-address",
    ]) {
      expect(GUIDE_REFERENCE_LIBRARY[id]?.lastReviewedAt).toBe("2026-09-01");
    }
  });
});
