import { describe, expect, it } from "bun:test";

describe("PWA assets", () => {
  it("publishes an installable manifest", async () => {
    const manifest = await Bun.file("public/manifest.webmanifest").json();

    expect(manifest.name).toBe("CaliGuide");
    expect(manifest.start_url).toBe("/");
    expect(manifest.display).toBe("standalone");
    expect(manifest.icons.length).toBeGreaterThan(0);
  });

  it("keeps private and API routes out of the service-worker cache", async () => {
    const serviceWorker = await Bun.file("public/sw.js").text();

    expect(serviceWorker).toContain('"/api"');
    expect(serviceWorker).toContain('"/forum"');
    expect(serviceWorker).toContain('"/chatbot"');
    expect(serviceWorker).toContain('"/profile"');
  });
});
