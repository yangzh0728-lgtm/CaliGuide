type SecurityHeaderOptions = {
  production: boolean;
};

export function buildSecurityHeaders({ production }: SecurityHeaderOptions) {
  const connectSources = [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://*.r2.cloudflarestorage.com",
    "https://*.r2.dev",
  ];

  if (!production) {
    connectSources.push("ws:", "http://localhost:*", "http://127.0.0.1:*");
  }

  const headers: Record<string, string> = {
    "Content-Security-Policy": [
      "default-src 'self'",
      production
        ? "script-src 'self'"
        : "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      `connect-src ${connectSources.join(" ")}`,
      "font-src 'self' data:",
      "object-src 'none'",
      "base-uri 'self'",
      "frame-ancestors 'none'",
      "form-action 'self'",
    ].join("; "),
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  };

  if (production) {
    headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains";
  }

  return headers;
}
