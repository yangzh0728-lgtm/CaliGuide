import { resolveApiUrl } from "./apiUrl";

const MAX_AREA_LENGTH = 64;
const MAX_MESSAGE_LENGTH = 240;
const MAX_PATH_LENGTH = 160;

export type ClientErrorReport = {
  area: string;
  message: string;
  path: string;
};

export function redactClientErrorMessage(value: string) {
  return value
    .replace(/Bearer\s+[^\s]+/gi, "Bearer [redacted]")
    .replace(/https?:\/\/[^\s]+/gi, "[url]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\b[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi, "[id]")
    .slice(0, MAX_MESSAGE_LENGTH)
    .trim();
}

export function normalizeClientErrorReport(value: unknown): ClientErrorReport | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const input = value as Record<string, unknown>;
  const area = typeof input.area === "string" ? input.area.trim().slice(0, MAX_AREA_LENGTH) : "";
  const rawMessage = typeof input.message === "string" ? input.message : "";
  const rawPath = typeof input.path === "string" ? input.path : "/";
  const message = redactClientErrorMessage(rawMessage);

  if (!area || !message || !/^[a-z0-9_.:-]+$/i.test(area)) {
    return null;
  }

  let path = "/";
  try {
    path = new URL(rawPath, "https://www.caliguide.org").pathname;
  } catch {
    path = "/";
  }

  return {
    area,
    message,
    path: path.slice(0, MAX_PATH_LENGTH),
  };
}

export function reportClientError(area: string, error: unknown) {
  if (typeof window === "undefined") {
    return;
  }

  const message = error instanceof Error ? error.message : String(error || "Unknown error");
  const report = normalizeClientErrorReport({ area, message, path: window.location.pathname });
  if (!report) {
    return;
  }

  void fetch(resolveApiUrl("/api/client-errors"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(report),
    keepalive: true,
  }).catch(() => undefined);
}
