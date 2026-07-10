import { describe, expect, it } from "bun:test";
import {
  OFFICIAL_CONTENT_LANGUAGES,
  getLocalizedBlogArticle,
  getLocalizedBlogArticles,
  getRecommendedBlogArticles,
  normalizeOfficialContentLanguage,
  searchLocalizedBlogArticles,
} from "./blogLocalization";
import { formatBlogBodyBlock } from "./blogBodyFormat";

describe("blogLocalization", () => {
  it("provides official content in the supported site languages", () => {
    expect(OFFICIAL_CONTENT_LANGUAGES).toEqual(["en", "zh-CN", "zh-TW", "es"]);

    for (const language of OFFICIAL_CONTENT_LANGUAGES) {
      const articles = getLocalizedBlogArticles(language);
      expect(articles.length).toBeGreaterThan(10);

      for (const article of articles) {
        expect(article.title.trim()).not.toBe("");
        expect(article.excerpt.trim()).not.toBe("");
        expect(article.body.length).toBeGreaterThan(0);
      }
    }
  });

  it("localizes recommended guide titles", () => {
    expect(getRecommendedBlogArticles("en")[0].title).toBe("How to Apply for a California Driver's License");
    expect(getRecommendedBlogArticles("zh-CN")[0].title).toBe("加州驾照申请步骤");
    expect(getRecommendedBlogArticles("zh-TW")[0].title).toContain("駕照");
    expect(getRecommendedBlogArticles("es")[0].title).toBe("Cómo solicitar una licencia de conducir de California");
  });

  it("normalizes Cantonese to Traditional Chinese official content", () => {
    expect(normalizeOfficialContentLanguage("yue")).toBe("zh-TW");
    expect(getLocalizedBlogArticle("category-banking", "yue")?.title).toContain("銀行");
  });

  it("localizes official link purposes for English and Spanish articles", () => {
    const englishArticle = getLocalizedBlogArticle("guide-1", "en");
    const spanishArticle = getLocalizedBlogArticle("guide-1", "es");

    expect(englishArticle?.officialLinks?.[0].purpose).toStartWith("Official reference");
    expect(spanishArticle?.officialLinks?.[0].purpose).toStartWith("Referencia oficial");
    expect(englishArticle?.officialLinks?.[0].purpose).not.toMatch(/[\u3400-\u9fff]/);
    expect(spanishArticle?.officialLinks?.[0].purpose).not.toMatch(/[\u3400-\u9fff]/);
  });

  it("keeps recommended card setup aligned across languages", () => {
    const englishCards = getRecommendedBlogArticles("en");

    for (const language of ["zh-CN", "zh-TW", "es"] as const) {
      const localizedCards = getRecommendedBlogArticles(language);

      expect(localizedCards.map((card) => card.id)).toEqual(englishCards.map((card) => card.id));
      expect(localizedCards.map((card) => card.image)).toEqual(englishCards.map((card) => card.image));
      expect(localizedCards.map((card) => card.createdAt)).toEqual(englishCards.map((card) => card.createdAt));
      expect(localizedCards.map((card) => card.readTime)).toEqual(englishCards.map((card) => card.readTime));
      for (const card of localizedCards) {
        expect(card.title.trim()).not.toBe("");
        expect(card.category.trim()).not.toBe("");
      }
    }
  });

  it("keeps DMV article body sections aligned across languages", () => {
    for (const articleId of ["category-dmv", "guide-1"]) {
      const englishArticle = getLocalizedBlogArticle(articleId, "en");
      const englishBlocks = englishArticle?.body.map(formatBlogBodyBlock) ?? [];
      const englishTones = englishBlocks.map((block) => block.tone);

      expect(englishArticle?.body.length).toBe(8);
      expect(englishTones).toEqual([
        "default",
        "checklist",
        "default",
        "default",
        "default",
        "default",
        "warning",
        "notice",
      ]);

      for (const language of OFFICIAL_CONTENT_LANGUAGES) {
        const article = getLocalizedBlogArticle(articleId, language);
        const blocks = article?.body.map(formatBlogBodyBlock) ?? [];
        const tones = blocks.map((block) => block.tone);

        expect(article?.body.length).toBe(englishArticle?.body.length);
        expect(tones).toEqual(englishTones);
        expect(tones).toContain("checklist");
        expect(tones).toContain("notice");
        expect(blocks.find((block) => block.tone === "checklist")?.listItems.length).toBeGreaterThan(3);
      }
    }
  });

  it("searches localized guide content across titles, tags, body text, and official links", () => {
    expect(searchLocalizedBlogArticles("en", "deposit").map((article) => article.id)).toContain("category-housing");
    expect(searchLocalizedBlogArticles("zh-CN", "押金").map((article) => article.id)).toContain("category-housing");
    expect(searchLocalizedBlogArticles("es", "licencia").map((article) => article.id)).toContain("guide-1");
    expect(searchLocalizedBlogArticles("en", "driver handbook").map((article) => article.id)).toContain("guide-1");
  });
});
