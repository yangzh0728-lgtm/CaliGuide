import { getLocalizedBlogArticle } from "./blogLocalization";
import { BLOG_ARTICLES } from "./blogContent";
import { getLegalDocument, LEGAL_PAGE_IDS } from "./legalContent";
import { getLegalPageFromPath, getLegalPagePath } from "./legalRoutes";
import {
  type AppRoute,
  getAppRouteFromPath,
  getAppRoutePath,
} from "./appRoutes";

const DEFAULT_DESCRIPTION =
  "Practical, multilingual guides for newcomers navigating life in California.";

export interface PageMetadata {
  title: string;
  description: string;
  canonicalPath: string;
  type: "website" | "article";
  imageUrl?: string;
  noIndex?: boolean;
}

export function getPageMetadata(route: AppRoute): PageMetadata {
  if (route.page === "blog") {
    const article = getLocalizedBlogArticle(route.articleId, "en");
    if (article) {
      return {
        title: `${article.title} | CaliGuide`,
        description: article.excerpt,
        canonicalPath: getAppRoutePath(route),
        type: "article",
        imageUrl: article.image,
      };
    }
  }

  if (route.page === "recommended") {
    return {
      title: "California Newcomer Guides | CaliGuide",
      description: "Browse practical California guides covering documents, housing, health, money, safety, work, and daily life.",
      canonicalPath: "/guides",
      type: "website",
    };
  }

  if (route.page === "home") {
    return {
      title: "CaliGuide | California Newcomer Guides",
      description: DEFAULT_DESCRIPTION,
      canonicalPath: "/",
      type: "website",
    };
  }

  return {
    title: "CaliGuide",
    description: DEFAULT_DESCRIPTION,
    canonicalPath: getAppRoutePath(route),
    type: "website",
    noIndex: true,
  };
}

export function getPageMetadataFromPath(pathname: string) {
  const appRoute = getAppRouteFromPath(pathname);
  if (appRoute) {
    return getPageMetadata(appRoute);
  }

  const legalPageId = getLegalPageFromPath(pathname);
  if (!legalPageId) {
    return null;
  }
  const document = getLegalDocument(legalPageId, "en");
  return {
    title: `${document.title} | CaliGuide`,
    description: document.summary,
    canonicalPath: getLegalPagePath(legalPageId),
    type: "website" as const,
  };
}

export function getPublicSitemapPaths() {
  const guidePaths = BLOG_ARTICLES.map((article) =>
    getAppRoutePath({ page: "blog", articleId: article.id }),
  );
  const legalPaths = LEGAL_PAGE_IDS.map(getLegalPagePath);

  return Array.from(new Set(["/", "/guides", ...guidePaths, ...legalPaths]));
}

export function buildSitemapXml(paths: string[], siteOrigin: string) {
  const origin = siteOrigin.replace(/\/+$/, "");
  const urls = paths
    .map((path) => `  <url><loc>${escapeHtml(`${origin}${path}`)}</loc></url>`)
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

export function buildRobotsText(siteOrigin: string) {
  const origin = siteOrigin.replace(/\/+$/, "");
  return [
    "User-agent: *",
    "Allow: /",
    "Disallow: /profile",
    "Disallow: /chatbot",
    `Sitemap: ${origin}/sitemap.xml`,
    "",
  ].join("\n");
}

export function injectPageMetadata(
  html: string,
  metadata: PageMetadata,
  siteOrigin: string,
) {
  const origin = siteOrigin.replace(/\/+$/, "");
  const canonicalUrl = `${origin}${metadata.canonicalPath}`;
  const tags = [
    `<title>${escapeHtml(metadata.title)}</title>`,
    `<meta name="description" content="${escapeHtml(metadata.description)}" />`,
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    `<meta property="og:title" content="${escapeHtml(metadata.title)}" />`,
    `<meta property="og:description" content="${escapeHtml(metadata.description)}" />`,
    `<meta property="og:type" content="${metadata.type}" />`,
    `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    metadata.imageUrl
      ? `<meta property="og:image" content="${escapeHtml(metadata.imageUrl)}" />`
      : "",
    metadata.noIndex ? `<meta name="robots" content="noindex,nofollow" />` : "",
  ].filter(Boolean).join("\n    ");

  const withoutManagedMetadata = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+name=["']description["'][^>]*>/i, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/i, "")
    .replace(/<meta\s+(?:property=["']og:[^"']+["']|name=["'](?:twitter:card|robots)["'])[^>]*>/gi, "");

  return withoutManagedMetadata.replace("</head>", `    ${tags}\n  </head>`);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}
