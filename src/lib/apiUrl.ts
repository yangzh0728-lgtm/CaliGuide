type ViteImportMeta = ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string;
    PROD?: boolean;
  };
};

export function getConfiguredApiBaseUrl() {
  return ((import.meta as ViteImportMeta).env?.VITE_API_BASE_URL ?? "").trim();
}

export function resolveApiUrl(path: string, apiBaseUrl = getConfiguredApiBaseUrl()) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const normalizedBaseUrl = apiBaseUrl.trim().replace(/\/+$/, "");

  if (!normalizedBaseUrl) {
    return normalizedPath;
  }

  return `${normalizedBaseUrl}${normalizedPath}`;
}

export function isProductionBuild() {
  return Boolean((import.meta as ViteImportMeta).env?.PROD);
}
