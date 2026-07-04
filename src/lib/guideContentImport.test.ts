import { describe, expect, it } from "bun:test";
import { buildGuideContentImportRows } from "./guideContentImport";

describe("guideContentImport", () => {
  it("builds Supabase rows from guide content JSON", () => {
    const rows = buildGuideContentImportRows({
      categories: [{ id: "dmv", label: "DMV", description: "DMV help", sortOrder: 10 }],
      tags: [{ id: "newcomer", label: "Newcomer" }],
      articles: [
        {
          id: "guide-dmv",
          slug: "guide-dmv",
          articleType: "guide",
          categoryId: "dmv",
          status: "draft",
          readingMinutes: 5,
          isFeatured: true,
          publishedAt: "2026-07-04T12:00:00Z",
          tagIds: ["newcomer"],
          translations: [
            {
              locale: "zh-CN",
              title: "加州 DMV 指南",
              summary: "摘要",
              body: [{ heading: "准备材料", content: ["准备身份证明。"] }],
            },
          ],
          officialLinks: [{ label: "DMV", url: "https://www.dmv.ca.gov/" }],
          mediaAssets: [{ kind: "cover", r2Key: "assets/platform/guide/guide-dmv/hero.jpg" }],
        },
      ],
    });

    expect(rows.categories).toEqual([{ id: "dmv", label: "DMV", description: "DMV help", sort_order: 10 }]);
    expect(rows.articles[0]).toMatchObject({
      id: "guide-dmv",
      article_type: "guide",
      category_id: "dmv",
      is_featured: true,
    });
    expect(rows.translations[0]).toMatchObject({
      article_id: "guide-dmv",
      locale: "zh-CN",
      title: "加州 DMV 指南",
    });
    expect(rows.articleTags).toEqual([{ article_id: "guide-dmv", tag_id: "newcomer", sort_order: 0 }]);
    expect(rows.officialLinks[0]).toMatchObject({
      article_id: "guide-dmv",
      title: "DMV",
      purpose: "DMV",
      sort_order: 0,
    });
    expect(rows.mediaAssets[0]).toMatchObject({ article_id: "guide-dmv", kind: "cover" });
  });

  it("throws when article references an unknown category or tag", () => {
    expect(() =>
      buildGuideContentImportRows({
        categories: [],
        tags: [],
        articles: [
          {
            id: "guide-dmv",
            slug: "guide-dmv",
            articleType: "guide",
            categoryId: "dmv",
            status: "draft",
            translations: [{ locale: "zh-CN", title: "Title", summary: "Summary", body: [] }],
            tagIds: ["missing-tag"],
          },
        ],
      }),
    ).toThrow("Unknown category dmv for article guide-dmv");
  });
});
