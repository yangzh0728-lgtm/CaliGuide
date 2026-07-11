import { getConfiguredApiBaseUrl, isProductionBuild, resolveApiUrl } from "./apiUrl";

type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface UserMediaStructureResult {
  objectKeys: string[];
}

export interface UserMediaStructureOptions {
  apiBaseUrl?: string;
  fetcher?: Fetcher;
  isProduction?: boolean;
}

export async function ensureUserMediaStructure(
  accessToken: string,
  options: Fetcher | UserMediaStructureOptions = fetch,
): Promise<UserMediaStructureResult> {
  if (!accessToken) {
    throw new Error("Sign in required");
  }

  const fetcher = typeof options === "function" ? options : options.fetcher ?? fetch;
  const apiBaseUrl = typeof options === "function" ? getConfiguredApiBaseUrl() : options.apiBaseUrl ?? getConfiguredApiBaseUrl();
  const isProduction = typeof options === "function" ? isProductionBuild() : options.isProduction ?? isProductionBuild();

  if (isProduction && !apiBaseUrl) {
    return { objectKeys: [] };
  }

  const response = await fetcher(resolveApiUrl("/api/uploads/user-structure", apiBaseUrl), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 404) {
    return { objectKeys: [] };
  }

  if (!response.ok) {
    throw new Error(await readUserMediaStructureError(response));
  }

  const payload = (await response.json()) as Partial<UserMediaStructureResult>;
  return {
    objectKeys: payload.objectKeys ?? [],
  };
}

async function readUserMediaStructureError(response: Response) {
  try {
    const body = (await response.json()) as { error?: string };
    return body.error || "Unable to prepare user media folders";
  } catch {
    return "Unable to prepare user media folders";
  }
}
