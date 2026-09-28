import { expect, test } from "bun:test";
import express from "express";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { mountProductionFrontend } from "./productionFrontend";

test("homepage and profile both use the current build after index.html is replaced", async () => {
  const directory = await mkdtemp(path.join(tmpdir(), "caliguide-frontend-"));
  const shell = (asset: string) => `<!doctype html><html><head><title>CaliGuide</title><script src="/assets/${asset}.js"></script></head><body><div id="root"></div></body></html>`;
  await writeFile(path.join(directory, "index.html"), shell("old-build"));
  const app = express();
  await mountProductionFrontend(app, directory, "https://www.caliguide.org");
  const server = app.listen(0, "127.0.0.1");
  try {
    await new Promise<void>((resolve, reject) => {
      server.once("listening", resolve);
      server.once("error", reject);
    });
    const address = server.address();
    if (!address || typeof address === "string") throw new Error("Test server failed to listen");
    const origin = `http://127.0.0.1:${address.port}`;
    expect(await (await fetch(`${origin}/profile`)).text()).toContain("old-build.js");
    await writeFile(path.join(directory, "index.html"), shell("new-build"));
    for (const route of ["/profile", "/", "/guides/first-30-days-in-california"]) {
      const response = await fetch(`${origin}${route}`);
      const html = await response.text();
      expect(response.status).toBe(200);
      expect(html).toContain("new-build.js");
      expect(html).not.toContain("old-build.js");
      expect(response.headers.get("cache-control")).toBe("no-cache");
    }
    const missing = await fetch(`${origin}/not-a-real-page`);
    expect(missing.status).toBe(404);
    expect(await missing.text()).toContain('name="robots" content="noindex,nofollow"');
    await rm(path.join(directory, "index.html"));
    const rebuilding = await fetch(`${origin}/profile`);
    expect(rebuilding.status).toBe(503);
    expect(await rebuilding.text()).not.toContain(directory);
  } finally {
    server.closeAllConnections();
    await new Promise<void>((resolve) => server.close(() => resolve()));
    await rm(directory, { recursive: true, force: true });
  }
});
