const PRIVATE_PREFIXES = ["/api", "/forum", "/chatbot", "/profile"] as const;

export function isOfflineCacheablePath(pathname: string) {
  const normalizedPath = pathname.startsWith("/") ? pathname : `/${pathname}`;
  return !PRIVATE_PREFIXES.some(
    (prefix) => normalizedPath === prefix || normalizedPath.startsWith(`${prefix}/`),
  );
}
