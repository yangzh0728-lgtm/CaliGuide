import { LegalPageId } from "./legalContent";

const LEGAL_PAGE_PATHS: Record<LegalPageId, string> = {
  about: "/about",
  editorial: "/editorial-policy",
  contact: "/contact",
  privacy: "/privacy",
  terms: "/terms",
  cookies: "/cookies",
  disclaimer: "/disclaimer",
};

export function getLegalPagePath(pageId: LegalPageId) {
  return LEGAL_PAGE_PATHS[pageId];
}

export function getLegalPageFromPath(pathname: string): LegalPageId | null {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
  const match = Object.entries(LEGAL_PAGE_PATHS).find(([, path]) => path === normalizedPath);
  return (match?.[0] as LegalPageId | undefined) ?? null;
}
