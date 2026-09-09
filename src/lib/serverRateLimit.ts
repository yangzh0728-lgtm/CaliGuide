import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

export const rateLimitErrorBody = {
  code: "RATE_LIMITED",
  error: "Too many requests. Please wait and try again.",
} as const;

export function buildRateLimitKey(_authorization: string | undefined, ip: string) {
  // These limits execute before authentication. Unverified tokens must never
  // let callers choose a new bucket (especially for anonymous guide reports).
  return ipKeyGenerator(ip || "unknown");
}

export function createApiRateLimiter({
  max,
  windowMs,
}: {
  max: number;
  windowMs: number;
}) {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: "draft-8",
    legacyHeaders: false,
    keyGenerator: (request: Request) => {
      const authorization = request.headers.authorization;
      const ip = request.ip || request.socket.remoteAddress || "unknown";
      if (authorization?.startsWith("Bearer ") && authorization.slice("Bearer ".length).trim()) {
        return buildRateLimitKey(authorization, ip);
      }
      return ipKeyGenerator(ip);
    },
    handler: (_request, response) => {
      response.status(429).json(rateLimitErrorBody);
    },
  });
}
