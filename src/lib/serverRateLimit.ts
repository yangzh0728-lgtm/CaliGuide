import { createHash } from "node:crypto";
import type { Request } from "express";
import { ipKeyGenerator, rateLimit } from "express-rate-limit";

export const rateLimitErrorBody = {
  code: "RATE_LIMITED",
  error: "Too many requests. Please wait and try again.",
} as const;

export function buildRateLimitKey(authorization: string | undefined, ip: string) {
  const token = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";

  if (token) {
    return `user:${createHash("sha256").update(token).digest("hex")}`;
  }

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
