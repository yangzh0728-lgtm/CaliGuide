import { describe, expect, it } from "bun:test";
import { BLOG_ARTICLES, getBlogArticle } from "./blogContent";

describe("blogContent", () => {
  it("provides publishable outline articles for home entry points", () => {
    const entryIds = [
      "category-dmv",
      "category-banking",
      "category-housing",
      "category-health",
      "guide-1",
      "guide-2",
      "forum-first-30-days",
      "trending-ssn",
      "trending-banking",
    ];

    expect(BLOG_ARTICLES).toHaveLength(entryIds.length);
    for (const id of entryIds) {
      const article = getBlogArticle(id);
      expect(article).toBeDefined();
      expect(article?.title).not.toMatch(/placeholder/i);
      expect(article?.excerpt).not.toMatch(/placeholder/i);
      expect(article?.body.join(" ")).not.toMatch(/placeholder/i);
      expect(article?.image).toMatch(/^https:\/\//);
      expect(article?.tags.length).toBeGreaterThanOrEqual(3);
      expect(article?.body.length).toBeGreaterThanOrEqual(3);
    }
  });
});
