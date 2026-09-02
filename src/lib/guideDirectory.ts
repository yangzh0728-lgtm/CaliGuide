import type { LanguageCode } from "../i18n/translations";
import { BLOG_ARTICLES, type BlogArticle } from "./blogContent";
import { getLocalizedBlogArticles, searchLocalizedBlogArticles } from "./blogLocalization";

export type GuideDirectoryGroupId =
  | "dmv"
  | "banking"
  | "housing"
  | "health"
  | "legal"
  | "jobs"
  | "transportation"
  | "safety"
  | "education"
  | "community";

export type GuideDirectoryFilterId = "all" | GuideDirectoryGroupId;

export const GUIDE_DIRECTORY_GROUPS: Array<{
  id: GuideDirectoryGroupId;
  labelKey: string;
  categories: string[];
}> = [
  { id: "dmv", labelKey: "recommended.group.dmv", categories: ["DMV"] },
  { id: "banking", labelKey: "recommended.group.banking", categories: ["Banking"] },
  { id: "housing", labelKey: "recommended.group.housing", categories: ["Housing"] },
  { id: "health", labelKey: "recommended.group.health", categories: ["Health"] },
  { id: "legal", labelKey: "recommended.group.legal", categories: ["Legal"] },
  { id: "jobs", labelKey: "recommended.group.jobs", categories: ["Jobs"] },
  {
    id: "transportation",
    labelKey: "recommended.group.transportation",
    categories: ["Transportation"],
  },
  { id: "safety", labelKey: "recommended.group.safety", categories: ["Safety"] },
  { id: "education", labelKey: "recommended.group.education", categories: ["Education"] },
  {
    id: "community",
    labelKey: "recommended.group.community",
    categories: ["Community Guide", "Forum Question"],
  },
];

const groupByArticleId = new Map(
  BLOG_ARTICLES.map((article) => [article.id, findGroupForCategory(article.category)]),
);

export function getGuideDirectoryArticles(
  language: LanguageCode,
  groupId: GuideDirectoryFilterId,
  query: string,
): BlogArticle[] {
  const localizedArticles = query.trim()
    ? searchLocalizedBlogArticles(language, query)
    : getLocalizedBlogArticles(language);

  if (groupId === "all") {
    return localizedArticles;
  }

  return localizedArticles.filter((article) => groupByArticleId.get(article.id) === groupId);
}

export function getGuideDirectoryCount(groupId: GuideDirectoryFilterId): number {
  if (groupId === "all") {
    return BLOG_ARTICLES.length;
  }

  return BLOG_ARTICLES.filter((article) => groupByArticleId.get(article.id) === groupId).length;
}

export function isGuideDirectoryGroupId(value: string): value is GuideDirectoryGroupId {
  return GUIDE_DIRECTORY_GROUPS.some((group) => group.id === value);
}

function findGroupForCategory(category: string): GuideDirectoryGroupId {
  const group = GUIDE_DIRECTORY_GROUPS.find(({ categories }) => categories.includes(category));

  if (!group) {
    throw new Error(`Guide category is missing from the directory taxonomy: ${category}`);
  }

  return group.id;
}
