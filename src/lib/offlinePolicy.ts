import { PUBLIC_AGENCY_PATH, PUBLIC_GUIDE_PATH } from "./publicSamples";
const PRIVATE_PREFIXES = ["/api", "/forum", "/chatbot", "/profile", "/guides", "/agencies"] as const;

export function isOfflineCacheablePath(pathname: string) {
  const normalizedPath = (pathname.startsWith("/") ? pathname : `/${pathname}`).replace(/\/+$/, "") || "/";
  if (normalizedPath === PUBLIC_GUIDE_PATH || normalizedPath === PUBLIC_AGENCY_PATH) return true;
  return !PRIVATE_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}
