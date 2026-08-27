import { describe, expect, test } from "bun:test";
import { buildRateLimitKey, rateLimitErrorBody } from "./serverRateLimit";

describe("server rate limiting", () => {
  test("uses a stable anonymous hash for authenticated users", () => {
    const first = buildRateLimitKey("Bearer user-access-token", "203.0.113.5");
    const second = buildRateLimitKey("Bearer user-access-token", "198.51.100.8");
    const other = buildRateLimitKey("Bearer another-token", "203.0.113.5");

    expect(first).toBe(second);
    expect(first).not.toBe(other);
    expect(first).not.toContain("user-access-token");
  });

  test("falls back to the client address and returns a friendly error", () => {
    expect(buildRateLimitKey(undefined, "203.0.113.5")).toBe("203.0.113.5");
    expect(rateLimitErrorBody).toEqual({
      code: "RATE_LIMITED",
      error: "Too many requests. Please wait and try again.",
    });
  });
});
