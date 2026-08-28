import { describe, expect, it } from "bun:test";
import { getResponsiveImageSource } from "./responsiveImage";

describe("responsive guide images", () => {
  it("builds width variants for Unsplash images", () => {
    const result = getResponsiveImageSource(
      "https://images.unsplash.com/photo-123?fit=crop&w=1200&q=80",
    );

    expect(result.srcSet).toContain("w=480");
    expect(result.srcSet).toContain("w=800");
    expect(result.srcSet).toContain("w=1200");
    expect(result.srcSet).toContain("480w");
    expect(result.src).toContain("w=1200");
  });

  it("does not rewrite uploaded or third-party images", () => {
    const source = "https://pub.example.r2.dev/assets/users/id/forum/post/photo.webp";

    expect(getResponsiveImageSource(source)).toEqual({ src: source });
  });
});
