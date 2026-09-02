import { describe, expect, it } from "bun:test";
import { BLOG_ARTICLES, getBlogArticle } from "./blogContent";
import { getGuideCitationSet } from "./guideCitations";

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
      "guide-moving-address-checklist",
      "trending-banking",
      "guide-legal-30-day-documents",
      "guide-newcomer-job-search",
      "guide-school-esl-resources",
      "guide-california-transportation",
      "guide-first-doctor-visit",
      "guide-earthquake-wildfire-preparedness",
      "guide-notario-fraud",
      "guide-workers-rights-wage-theft",
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
    expect(getBlogArticle("guide-earthquake-wildfire-preparedness")?.body.join(" ")).toContain("趴下、掩护、抓牢");
    expect(getBlogArticle("guide-notario-fraud")?.body.join(" ")).toContain("notario");
    expect(getBlogArticle("guide-workers-rights-wage-theft")?.body.join(" ")).toContain("移民身份");
  });

  it("adds the first safety collection with searchable categories and cited sources", () => {
    expect(getBlogArticle("guide-earthquake-wildfire-preparedness")?.category).toBe("Safety");
    expect(getBlogArticle("guide-notario-fraud")?.category).toBe("Legal");
    expect(getBlogArticle("guide-workers-rights-wage-theft")?.category).toBe("Jobs");

    for (const id of [
      "guide-earthquake-wildfire-preparedness",
      "guide-notario-fraud",
      "guide-workers-rights-wage-theft",
    ]) {
      const article = getBlogArticle(id);
      expect(getGuideCitationSet(id)?.references.length).toBeGreaterThanOrEqual(3);
      expect(article?.body.length).toBe(8);
    }
  });

  it("keeps official sources out of the legacy article model", () => {
    for (const article of BLOG_ARTICLES) {
      expect("officialLinks" in article).toBe(false);
    }
  });

  it("publishes the first 30 days guide as an actionable sequencing hub", () => {
    const article = getBlogArticle("forum-first-30-days");

    expect(article?.title).toBe("First 30 Days in California");
    expect(article?.readTime).toBe("4 min read");
    expect(article?.tags).toContain("Sequencing");
    expect(article?.body).toHaveLength(11);
    expect(article?.body[1]).toStartWith("What blocks what:");
    expect(article?.body[2]).toStartWith("Preparation checklist:");
    expect(article?.body[9]).toStartWith("Common sequencing mistakes:");
    expect(article?.body[10]).toStartWith("Official reminder:");
    expect(article?.body.join(" ")).not.toContain("[[guides:");
  });

  it("publishes statewide SSN application guidance instead of a San Jose-only article", () => {
    const article = getBlogArticle("trending-ssn");

    expect(article?.title).toBe("How to Apply for a Social Security Number (SSN)");
    expect(article?.tags).not.toContain("San Jose");
    expect(article?.body.join(" ")).not.toContain("San Jose");
    expect(article?.body.join(" ")).toContain("work authorization");
    expect(article?.body.join(" ")).toContain("original documents");
  });

  it("publishes a timing-first California moving and address checklist", () => {
    const article = getBlogArticle("guide-moving-address-checklist");

    expect(article?.title).toBe("Moving in California: Every Address and Account to Update");
    expect(article?.body).toHaveLength(10);
    expect(article?.body[1]).toStartWith("Deadline table:");
    expect(article?.body[3]).toStartWith("Within 10 days:");
    expect(article?.body[6]).toContain("Social Security card");
    expect(article?.body[8]).toStartWith("Common sequencing mistakes:");
    expect(article?.body[9]).toStartWith("Official reminder:");
    expect(article?.body.join(" ")).toContain("USPS forwarding does not update USCIS");
    expect(article?.body.join(" ")).toContain("driver license or ID and each vehicle");
  });
});
