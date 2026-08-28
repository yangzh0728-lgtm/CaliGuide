import { describe, expect, it } from "bun:test";
import { buildSecurityHeaders } from "./securityHeaders";

describe("security headers", () => {
  it("locks down framing, MIME sniffing, referrers, and browser capabilities", () => {
    const headers = buildSecurityHeaders({ production: false });

    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["X-Frame-Options"]).toBe("DENY");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Permissions-Policy"]).toContain("camera=()");
    expect(headers["Content-Security-Policy"]).toContain("frame-ancestors 'none'");
    expect(headers["Content-Security-Policy"]).toContain("'unsafe-inline'");
    expect(headers["Strict-Transport-Security"]).toBeUndefined();
  });

  it("adds HSTS only in production", () => {
    const headers = buildSecurityHeaders({ production: true });

    expect(headers["Strict-Transport-Security"]).toBe(
      "max-age=31536000; includeSubDomains",
    );
  });

  it("allows the services required by CaliGuide without permitting arbitrary scripts", () => {
    const policy = buildSecurityHeaders({ production: true })["Content-Security-Policy"];

    expect(policy).toContain("script-src 'self'");
    expect(policy).toContain("https://*.supabase.co");
    expect(policy).toContain("wss://*.supabase.co");
    expect(policy).toContain("https://*.r2.cloudflarestorage.com");
    expect(policy).toContain("object-src 'none'");
    expect(policy).not.toContain("script-src 'self' 'unsafe-inline'");
  });
});
