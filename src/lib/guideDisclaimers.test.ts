import { describe, expect, it } from "bun:test";
import { BLOG_ARTICLES } from "./blogContent";
import {
  GUIDE_DISCLAIMER_KIND_ORDER,
  getGuideDisclaimerKinds,
  hasGuideDisclaimer,
} from "./guideDisclaimers";

describe("guideDisclaimers", () => {
  it("marks immigration and tenancy guides as legal", () => {
    expect(getGuideDisclaimerKinds("guide-legal-30-day-documents")).toEqual(["legal"]);
    expect(getGuideDisclaimerKinds("guide-real-id-documents")).toEqual(["legal"]);
    expect(getGuideDisclaimerKinds("guide-2")).toEqual(["legal"]);
  });

  it("marks health guides as medical", () => {
    expect(getGuideDisclaimerKinds("guide-first-doctor-visit")).toEqual(["medical"]);
    expect(getGuideDisclaimerKinds("category-health")).toEqual(["medical", "financial"]);
  });

  it("marks banking guides as financial", () => {
    expect(getGuideDisclaimerKinds("category-banking")).toEqual(["financial"]);
  });

  it("returns multiple kinds in a stable order", () => {
    expect(getGuideDisclaimerKinds("trending-banking")).toEqual(["legal", "financial"]);
    expect(getGuideDisclaimerKinds("guide-rental-scams")).toEqual(["legal", "financial"]);
  });

  it("returns no disclaimer for low-risk guides", () => {
    expect(getGuideDisclaimerKinds("guide-school-esl-resources")).toEqual([]);
    expect(getGuideDisclaimerKinds("forum-first-30-days")).toEqual([]);
  });

  it("returns no disclaimer for unknown articles", () => {
    expect(getGuideDisclaimerKinds("does-not-exist")).toEqual([]);
    expect(hasGuideDisclaimer("does-not-exist")).toBe(false);
  });

  it("reports whether a guide needs a disclaimer", () => {
    expect(hasGuideDisclaimer("category-banking")).toBe(true);
    expect(hasGuideDisclaimer("guide-school-esl-resources")).toBe(false);
  });

  it("only maps article ids that exist in the guide library", () => {
    const articleIds = new Set(BLOG_ARTICLES.map((article) => article.id));

    for (const article of BLOG_ARTICLES) {
      for (const kind of getGuideDisclaimerKinds(article.id)) {
        expect(GUIDE_DISCLAIMER_KIND_ORDER).toContain(kind);
      }
    }

    expect(articleIds.has("category-banking")).toBe(true);
  });

  it("covers every guide that gives legal, medical, or financial guidance", () => {
    const sensitiveCategories = new Set(["Banking", "Health", "Housing", "Legal", "DMV", "Jobs", "Transportation"]);
    const uncovered = BLOG_ARTICLES.filter(
      (article) => sensitiveCategories.has(article.category) && !hasGuideDisclaimer(article.id),
    );

    expect(uncovered.map((article) => article.id)).toEqual([]);
  });
});
