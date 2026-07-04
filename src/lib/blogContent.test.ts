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
      "guide-real-id-documents",
      "guide-rental-scams",
      "forum-first-30-days",
      "trending-ssn",
      "trending-banking",
      "guide-legal-30-day-documents",
      "guide-newcomer-job-search",
      "guide-school-esl-resources",
      "guide-california-transportation",
      "guide-first-doctor-visit",
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

  it("includes the new Chinese guide outlines from the content plan", () => {
    expect(getBlogArticle("guide-1")?.body.join(" ")).toContain("AB 60");
    expect(getBlogArticle("guide-real-id-documents")?.body.join(" ")).toContain("REAL ID");
    expect(getBlogArticle("category-banking")?.body.join(" ")).toContain("FDIC");
    expect(getBlogArticle("category-housing")?.body.join(" ")).toContain("21 天");
    expect(getBlogArticle("guide-rental-scams")?.body.join(" ")).toContain("假房源");
    expect(getBlogArticle("category-health")?.body.join(" ")).toContain("Covered California");
    expect(getBlogArticle("guide-first-doctor-visit")?.body.join(" ")).toContain("Explanation of Benefits");
    expect(getBlogArticle("trending-banking")?.body.join(" ")).toContain("ITIN");
    expect(getBlogArticle("guide-legal-30-day-documents")?.body.join(" ")).toContain("I-94");
    expect(getBlogArticle("guide-newcomer-job-search")?.body.join(" ")).toContain("AJCC");
    expect(getBlogArticle("guide-school-esl-resources")?.body.join(" ")).toContain("ESL");
    expect(getBlogArticle("guide-california-transportation")?.body.join(" ")).toContain("汽车保险");
  });

  it("adds official links to DMV and Banking guide articles", () => {
    expect(getBlogArticle("guide-1")?.officialLinks?.map((link) => link.url)).toContain(
      "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/driver-licenses-dl/",
    );
    expect(getBlogArticle("guide-real-id-documents")?.officialLinks?.map((link) => link.url)).toContain(
      "https://www.dmv.ca.gov/portal/driver-licenses-identification-cards/real-id/real-id-checklist/",
    );
    expect(getBlogArticle("category-banking")?.officialLinks?.map((link) => link.url)).toContain(
      "https://www.fdic.gov/getbanked",
    );
    expect(getBlogArticle("trending-banking")?.officialLinks?.map((link) => link.url)).toContain(
      "https://www.irs.gov/tin/itin/individual-taxpayer-identification-number-itin",
    );
  });
});
