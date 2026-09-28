import express, { type Express } from "express";
import path from "node:path";
import { readFile } from "node:fs/promises";
import { getPageMetadata, getPageMetadataFromPath, injectPageMetadata } from "./pageMetadata";

export async function mountProductionFrontend(app: Express, distPath: string, publicSiteOrigin: string) {
  app.use(express.static(distPath, { index: false }));
  app.get("*", async (req, res) => {
    res.set("Cache-Control", "no-cache");
    let appShell: string;
    try {
      // Read the current build for deep links as well as the homepage.
      appShell = await readFile(path.join(distPath, "index.html"), "utf8");
    } catch {
      res.status(503).type("text").send("Application temporarily unavailable. Please try again.");
      return;
    }
    const routeMetadata = getPageMetadataFromPath(req.path);
    const metadata = routeMetadata ?? {
      ...getPageMetadata({ page: "home" }),
      canonicalPath: req.path,
      noIndex: true,
    };
    res.status(routeMetadata ? 200 : 404).type("html")
      .send(injectPageMetadata(appShell, metadata, publicSiteOrigin));
  });
}
