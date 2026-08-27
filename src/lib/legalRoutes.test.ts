import { describe, expect, test } from "bun:test";
import { getLegalPageFromPath, getLegalPagePath } from "./legalRoutes";

describe("legal routes", () => {
  test("maps each public legal page to a stable path", () => {
    expect(getLegalPagePath("privacy")).toBe("/privacy");
    expect(getLegalPagePath("terms")).toBe("/terms");
    expect(getLegalPagePath("cookies")).toBe("/cookies");
    expect(getLegalPagePath("disclaimer")).toBe("/disclaimer");
  });

  test("resolves direct and normalized legal paths", () => {
    expect(getLegalPageFromPath("/privacy")).toBe("privacy");
    expect(getLegalPageFromPath("/terms/")).toBe("terms");
    expect(getLegalPageFromPath("/unknown")).toBeNull();
    expect(getLegalPageFromPath("/")).toBeNull();
  });
});
