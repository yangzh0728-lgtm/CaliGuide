import { BLOG_ARTICLES } from "./blogContent";
import { getInstitution } from "./institutions";

export type AppRoute =
  | { page: "home" }
  | { page: "recommended" }
  | { page: "blog"; articleId: string }
  | { page: "agencies"; institutionId?: string }
  | { page: "forum" }
  | { page: "forumDetail"; discussionId: string }
  | { page: "chatbot" }
  | { page: "profile" };

export const GUIDE_SLUG_BY_ID: Record<string, string> = {
  "category-dmv": "california-dmv-new-resident-checklist",
  "category-banking": "open-us-bank-account-newcomers",
  "category-housing": "first-california-rental-checklist",
  "category-health": "california-health-insurance-basics",
  "guide-1": "california-driver-license-application",
  "guide-real-id-documents": "california-real-id-documents",
  "guide-2": "california-rental-handbook",
  "guide-rental-scams": "avoid-california-rental-scams",
  "forum-first-30-days": "first-30-days-in-california",
  "trending-ssn": "san-jose-ssn-appointment",
  "trending-banking": "open-bank-account-with-passport",
  "guide-first-doctor-visit": "first-doctor-visit-california",
  "guide-legal-30-day-documents": "newcomer-document-plan",
  "guide-newcomer-job-search": "newcomer-job-search-california",
  "guide-school-esl-resources": "california-school-esl-resources",
  "guide-california-transportation": "california-transportation-guide",
  "guide-earthquake-wildfire-preparedness": "california-earthquake-wildfire-preparedness",
  "guide-notario-fraud": "avoid-notario-fraud-california",
  "guide-workers-rights-wage-theft": "california-workers-rights-wage-theft",
};

const GUIDE_ID_BY_SLUG = Object.fromEntries(
  Object.entries(GUIDE_SLUG_BY_ID).map(([articleId, slug]) => [slug, articleId]),
);

const BLOG_ARTICLE_IDS = new Set(BLOG_ARTICLES.map((article) => article.id));

export function getGuideSlug(articleId: string) {
  return GUIDE_SLUG_BY_ID[articleId] ?? null;
}

export function getAppRouteFromPath(pathname: string): AppRoute | null {
  const normalizedPath = normalizePath(pathname);

  if (normalizedPath === "/") {
    return { page: "home" };
  }
  if (normalizedPath === "/guides") {
    return { page: "recommended" };
  }
  if (normalizedPath.startsWith("/guides/")) {
    const slug = decodePathPart(normalizedPath.slice("/guides/".length));
    const articleId = GUIDE_ID_BY_SLUG[slug];
    return articleId ? { page: "blog", articleId } : { page: "recommended" };
  }
  if (normalizedPath === "/agencies") {
    return { page: "agencies" };
  }
  if (normalizedPath.startsWith("/agencies/")) {
    const institutionId = decodePathPart(normalizedPath.slice("/agencies/".length));
    return getInstitution(institutionId)
      ? { page: "agencies", institutionId }
      : { page: "agencies" };
  }
  if (normalizedPath === "/forum") {
    return { page: "forum" };
  }
  if (normalizedPath.startsWith("/forum/")) {
    const discussionId = decodePathPart(normalizedPath.slice("/forum/".length));
    return discussionId ? { page: "forumDetail", discussionId } : { page: "forum" };
  }
  if (normalizedPath === "/chatbot") {
    return { page: "chatbot" };
  }
  if (normalizedPath === "/profile") {
    return { page: "profile" };
  }

  return null;
}

export function getAppRoutePath(route: AppRoute) {
  switch (route.page) {
    case "home":
      return "/";
    case "recommended":
      return "/guides";
    case "blog": {
      const slug = getGuideSlug(route.articleId);
      if (!slug || !BLOG_ARTICLE_IDS.has(route.articleId)) {
        return "/guides";
      }
      return `/guides/${slug}`;
    }
    case "agencies":
      return route.institutionId && getInstitution(route.institutionId)
        ? `/agencies/${encodeURIComponent(route.institutionId)}`
        : "/agencies";
    case "forum":
      return "/forum";
    case "forumDetail":
      return `/forum/${encodeURIComponent(route.discussionId)}`;
    case "chatbot":
      return "/chatbot";
    case "profile":
      return "/profile";
  }
}

export function isPublicAppRoute(route: AppRoute) {
  return route.page === "home" || route.page === "recommended" || route.page === "blog" || route.page === "agencies";
}

export function shouldRequireAuthentication(route: AppRoute, accountActionRequested: boolean) {
  return accountActionRequested || !isPublicAppRoute(route);
}

export function getParentAppRoute(route: AppRoute): AppRoute {
  switch (route.page) {
    case "blog":
      return { page: "recommended" };
    case "agencies":
      return { page: "recommended" };
    case "forumDetail":
      return { page: "forum" };
    case "home":
    case "recommended":
    case "forum":
    case "chatbot":
    case "profile":
      return { page: "home" };
  }
}

function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }
  const pathOnly = pathname.split(/[?#]/, 1)[0];
  const withLeadingSlash = pathOnly.startsWith("/") ? pathOnly : `/${pathOnly}`;
  return withLeadingSlash.replace(/\/+$/, "");
}

function decodePathPart(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return "";
  }
}
