type Fetcher = (url: string, init?: RequestInit) => Promise<Response>;

export interface UserMediaStructureResult {
  objectKeys: string[];
}

export async function ensureUserMediaStructure(
  accessToken: string,
  fetcher: Fetcher = fetch,
): Promise<UserMediaStructureResult> {
  if (!accessToken) {
    throw new Error("Sign in required");
  }

  const response = await fetcher("/api/uploads/user-structure", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

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
