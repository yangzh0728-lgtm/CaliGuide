import type { SupabaseClient } from "@supabase/supabase-js";
import { resolveApiUrl } from "./apiUrl";

type SupabaseSessionClient = SupabaseClient | {
  auth: {
    getSession: () => Promise<{
      data: { session: { access_token: string } | null };
      error: { message: string } | null;
    }>;
  };
};

async function getAccessToken(client: SupabaseSessionClient) {
  const { data, error } = await client.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }
  if (!data.session?.access_token) {
    throw new Error("Sign in required");
  }

  return data.session.access_token;
}

async function requestAccountJson<TResponse>(
  client: SupabaseSessionClient,
  path: string,
  init: RequestInit,
): Promise<TResponse> {
  const accessToken = await getAccessToken(client);
  const response = await fetch(resolveApiUrl(path), {
    ...init,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
    },
  });
  const responseText = await response.text();
  const payload = parseJsonObject(responseText);

  if (!response.ok) {
    throw new Error(
      typeof payload.error === "string"
        ? payload.error
        : "Unable to complete the account data request. Please try again.",
    );
  }

  return payload as TResponse;
}

function parseJsonObject(value: string): Record<string, unknown> {
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {};
  }
}

export function requestAccountExportViaApi(client: SupabaseSessionClient) {
  return requestAccountJson<Record<string, unknown>>(client, "/api/account/export", {
    method: "GET",
  });
}

export function deleteAccountViaApi(
  client: SupabaseSessionClient,
  confirmation: string,
) {
  return requestAccountJson<{ ok: true }>(client, "/api/account/delete", {
    method: "POST",
    body: JSON.stringify({ confirmation }),
  });
}
