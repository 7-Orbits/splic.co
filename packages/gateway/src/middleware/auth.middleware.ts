/**
 * Authentication + origin-guard middleware.
 *
 * `requireSession` validates the application credential (the
 * `splic_auth_session` cookie) against the `auth_sessions` table and
 * attaches the resulting context to `req.auth`. Any protected `/v1/*` route
 * mounted later must use it.
 *
 * `requireSiteOrigin` is double defence-in-depth for state-changing
 * endpoints: the session cookie is `SameSite=Lax` (so browsers never send it
 * cross-site), and when a browser *does* send an `Origin` header it must be
 * one of the configured frontend origins. Requests without an `Origin`
 * header (server-to-server, future desktop client) pass this guard and still
 * need a valid credential.
 */

import type { NextFunction, Request, Response } from "express";
import { isSiteOrigin } from "../env.ts";
import { safeErrorDescription } from "../errors.ts";
import { getSessionContext, SESSION_COOKIE_NAME } from "../services/session.service.ts";
import type { AuthedRequest } from "../types.ts";

export function readSessionToken(req: Request): string | undefined {
  const token = req.cookies?.[SESSION_COOKIE_NAME];
  return typeof token === "string" && token.length > 0 ? token : undefined;
}

/** Require a valid, unexpired, unrevoked session for an active user. */
export async function requireSession(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const token = readSessionToken(req);
  if (!token) {
    res.status(401).json({ authenticated: false });
    return;
  }

  try {
    const context = await getSessionContext(token);
    if (!context) {
      res.status(401).json({ authenticated: false });
      return;
    }
    (req as AuthedRequest).auth = context;
    next();
  } catch (error) {
    // Database failure: honestly unavailable, never "unauthenticated".
    console.error("[auth] session validation failed:", safeErrorDescription(error));
    res.status(503).json({ error: "storage_unavailable" });
  }
}

/** Reject browser requests whose Origin is not a configured site origin. */
export function requireSiteOrigin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const origin = req.headers.origin;
  if (origin && !isSiteOrigin(origin)) {
    res.status(403).json({ error: "origin_not_allowed" });
    return;
  }
  next();
}

/** Convenience for controllers: audit metadata for session rows. */
export function sessionMetadata(req: Request): {
  userAgent: string | null;
  ipAddress: string | null;
} {
  return {
    userAgent: req.get("user-agent") ?? null,
    ipAddress: req.ip ?? null,
  };
}
