import { describe, expect, it } from "bun:test";
import { resolveApiUrl } from "./apiUrl";

describe("apiUrl", () => {
  it("keeps same-origin API paths when no API base URL is configured", () => {
    expect(resolveApiUrl("/api/uploads/file", "")).toBe("/api/uploads/file");
  });

  it("targets the configured backend API base URL", () => {
    expect(resolveApiUrl("/api/uploads/file", "https://api.caliguide.org/")).toBe(
      "https://api.caliguide.org/api/uploads/file",
    );
  });
});
