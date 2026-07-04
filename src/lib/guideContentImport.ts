type Locale = "en" | "zh-CN" | "zh-HK" | "zh-TW" | "es";

export interface GuideContentImportData {
  categories: Array<{
    id: string;
    label: string;
    description?: string;
    sortOrder?: number;
  }>;
  tags: Array<{
    id: string;
    label: string;
  }>;
  articles: GuideContentArticle[];
}

export interface GuideContentArticle {
  id: string;
  slug: string;
  articleType: "guide" | "blog" | "question";
  categoryId: string;
  status: "draft" | "review" | "published" | "archived";
  coverImageKey?: string;
  readingMinutes?: number;
  isFeatured?: boolean;
  publishedAt?: string;
  tagIds?: string[];
  translations: Array<{
    locale: Locale;
    title: string;
    summary: string;
    body: Array<Record<string, unknown>>;
    seoTitle?: string;
    seoDescription?: string;
  }>;
  officialLinks?: Array<{
    title?: string;
    label?: string;
    url: string;
    purpose?: string;
    sortOrder?: number;
  }>;
  mediaAssets?: Array<{
    kind: "cover" | "image" | "attachment";
    r2Key: string;
    publicUrl?: string;
    altText?: string;
    caption?: string;
    sortOrder?: number;
  }>;
}

export function buildGuideContentImportRows(data: GuideContentImportData) {
  validateReferences(data);

  const categories = data.categories.map((category) => ({
    id: category.id,
    label: category.label,
    description: category.description ?? null,
    sort_order: category.sortOrder ?? 0,
  }));

  const tags = data.tags.map((tag) => ({
    id: tag.id,
    label: tag.label,
  }));

  const articles = data.articles.map((article) => ({
    id: article.id,
    slug: article.slug,
    article_type: article.articleType,
    category_id: article.categoryId,
    status: article.status,
    cover_image_key: article.coverImageKey ?? null,
    reading_minutes: article.readingMinutes ?? 5,
    is_featured: article.isFeatured ?? false,
    published_at: article.publishedAt ?? null,
  }));

  const translations = data.articles.flatMap((article) =>
    article.translations.map((translation) => ({
      article_id: article.id,
      locale: translation.locale,
      title: translation.title,
      summary: translation.summary,
      body: translation.body,
      seo_title: translation.seoTitle ?? null,
      seo_description: translation.seoDescription ?? null,
    })),
  );

  const articleTags = data.articles.flatMap((article) =>
    (article.tagIds ?? []).map((tagId, index) => ({
      article_id: article.id,
      tag_id: tagId,
      sort_order: index,
    })),
  );

  const officialLinks = data.articles.flatMap((article) =>
    (article.officialLinks ?? []).map((link, index) => {
      const title = link.title ?? link.label ?? link.url;

      return {
        article_id: article.id,
        title,
        url: link.url,
        purpose: link.purpose ?? title,
        sort_order: link.sortOrder ?? index,
      };
    }),
  );

  const mediaAssets = data.articles.flatMap((article) =>
    (article.mediaAssets ?? []).map((asset, index) => ({
      article_id: article.id,
      kind: asset.kind,
      r2_key: asset.r2Key,
      public_url: asset.publicUrl ?? null,
      alt_text: asset.altText ?? null,
      caption: asset.caption ?? null,
      sort_order: asset.sortOrder ?? index,
    })),
  );

  return {
    articleIds: data.articles.map((article) => article.id),
    categories,
    tags,
    articles,
    translations,
    articleTags,
    officialLinks,
    mediaAssets,
  };
}

function validateReferences(data: GuideContentImportData) {
  const categoryIds = new Set(data.categories.map((category) => category.id));
  const tagIds = new Set(data.tags.map((tag) => tag.id));

  for (const article of data.articles) {
    if (!categoryIds.has(article.categoryId)) {
      throw new Error(`Unknown category ${article.categoryId} for article ${article.id}`);
    }

    for (const tagId of article.tagIds ?? []) {
      if (!tagIds.has(tagId)) {
        throw new Error(`Unknown tag ${tagId} for article ${article.id}`);
      }
    }
  }
}
