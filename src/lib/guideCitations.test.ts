import { describe, expect, it } from "bun:test";
import { BLOG_ARTICLES } from "./blogContent";
import {
  getGuideCitationSet,
  getSectionCitationNumbers,
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
});
