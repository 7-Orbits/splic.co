import type { NextFunction, Request, Response } from "express";
import { isSiteOrigin } from "../env.ts";

const ALLOWED_METHODS = "GET, POST, OPTIONS";
const ALLOWED_HEADERS = "Content-Type";
const MAX_AGE_SECONDS = "600";

/**
 * Centrally configured CORS middleware for Gateway.
 *
 * - Allows approved site origins configured via environment (local dev & production).
 * - Enables credentials (`Access-Control-Allow-Credentials: true`) for cookie-based session auth.
 * - Restricts methods to GET, POST, OPTIONS and headers to Content-Type.
 * - Handles preflight OPTIONS requests: returns 204 for approved origins, 403 for unapproved origins.
 * - Sets Vary: Origin for proper cache behavior across origins.
 * - Rejects unapproved cross-origin access without using wildcard origins with credentials.
 */
export function corsMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = req.headers.origin;

  if (origin) {
    if (isSiteOrigin(origin)) {
      const normalizedOrigin = origin.trim().replace(/\/+$/, "");
      res.setHeader("Access-Control-Allow-Origin", normalizedOrigin);
      res.setHeader("Vary", "Origin");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
      res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
      res.setHeader("Access-Control-Max-Age", MAX_AGE_SECONDS);
    } else if (req.method === "OPTIONS") {
      // Reject preflight from unapproved origin
      res.status(403).end();
      return;
    }
  }

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  next();
}
