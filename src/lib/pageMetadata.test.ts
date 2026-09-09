import { describe, expect, it } from "bun:test";
import { LEGAL_PAGE_IDS } from "./legalContent";
import { getLegalPagePath } from "./legalRoutes";
import {
  buildRobotsText,
  buildSitemapXml,
  getPageMetadata,
  getPageMetadataFromPath,
  getPublicSitemapPaths,
  injectPageMetadata,
} from "./pageMetadata";

describe("public page metadata", () => {
  it("uses the guide title, excerpt, and canonical route", () => {
    const metadata = getPageMetadata({ page: "blog", articleId: "guide-real-id-documents" });

    expect(metadata.title).toContain("REAL ID");
    expect(metadata.description).toBeTruthy();
    expect(metadata.canonicalPath).toBe("/guides/california-real-id-documents");
    expect(metadata.type).toBe("article");
  });

  it("resolves metadata for public legal paths and rejects unknown paths", () => {
    expect(getPageMetadataFromPath("/privacy")?.title).toContain("Privacy Policy");
    expect(getPageMetadataFromPath("/guides/california-real-id-documents")?.type).toBe("article");
    expect(getPageMetadataFromPath("/agencies/ca-dmv")?.title).toContain("California DMV");
    expect(getPageMetadataFromPath("/not-a-page")).toBeNull();
  });

  it("injects escaped canonical and social metadata into the application shell", () => {
    const html = injectPageMetadata(
      '<html><head><title>CaliGuide</title><meta name="description" content="default" /></head></html>',
      {
        title: 'Guide <title>',
        description: 'Documents & next steps',
        canonicalPath: '/guides/example',
        type: 'article',
      },
      'https://www.caliguide.org',
    );

    expect(html).toContain("Guide &lt;title&gt;");
    expect(html).toContain("Documents &amp; next steps");
    expect(html).toContain('href="https://www.caliguide.org/guides/example"');
    expect(html).toContain('property="og:type" content="article"');
  });

  it("lists only the samples, home, and trust pages in the public sitemap", () => {
    const paths = getPublicSitemapPaths();

    expect(paths).toContain("/");
    expect(paths).not.toContain("/guides");
    expect(paths).not.toContain("/agencies");
    expect(paths.filter((path) => path.startsWith("/guides/"))).toEqual(["/guides/first-30-days-in-california"]);
    expect(paths.filter((path) => path.startsWith("/agencies/"))).toEqual(["/agencies/ca-dmv"]);
    for (const pageId of LEGAL_PAGE_IDS) {
      expect(paths).toContain(getLegalPagePath(pageId));
    }
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("marks restricted guides and agency pages noindex", () => {
    for (const path of ["/guides", "/guides/california-real-id-documents", "/agencies", "/agencies/uscis", "/forum/post-1"])
      expect(getPageMetadataFromPath(path)?.noIndex).toBe(true);
    expect(getPageMetadataFromPath("/guides/first-30-days-in-california")?.noIndex).toBe(false);
    expect(getPageMetadataFromPath("/agencies/ca-dmv")?.noIndex).toBe(false);
  });

  it("builds crawler files with absolute public URLs", () => {
    const sitemap = buildSitemapXml(["/", "/guides/example"], "https://www.caliguide.org/");
    const robots = buildRobotsText("https://www.caliguide.org/");

    expect(sitemap).toContain("https://www.caliguide.org/guides/example");
    expect(robots).toContain("Sitemap: https://www.caliguide.org/sitemap.xml");
    expect(robots).toContain("Disallow: /profile");
  });
});
