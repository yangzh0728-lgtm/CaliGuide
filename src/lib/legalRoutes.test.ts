import { describe, expect, test } from "bun:test";
import { getLegalPageFromPath, getLegalPagePath } from "./legalRoutes";

describe("legal routes", () => {
  test("maps each public legal page to a stable path", () => {
    expect(getLegalPagePath("about")).toBe("/about");
    expect(getLegalPagePath("editorial")).toBe("/editorial-policy");
    expect(getLegalPagePath("contact")).toBe("/contact");
    expect(getLegalPagePath("privacy")).toBe("/privacy");
    expect(getLegalPagePath("terms")).toBe("/terms");
    expect(getLegalPagePath("cookies")).toBe("/cookies");
    expect(getLegalPagePath("disclaimer")).toBe("/disclaimer");
  });

  test("resolves direct and normalized legal paths", () => {
    expect(getLegalPageFromPath("/about")).toBe("about");
    expect(getLegalPageFromPath("/editorial-policy/")).toBe("editorial");
    expect(getLegalPageFromPath("/contact")).toBe("contact");
    expect(getLegalPageFromPath("/privacy")).toBe("privacy");
    expect(getLegalPageFromPath("/terms/")).toBe("terms");
    expect(getLegalPageFromPath("/unknown")).toBeNull();
    expect(getLegalPageFromPath("/")).toBeNull();
  });
});
