/**
 * Shared request/auth types for the Gateway.
 *
 * `requireAuth` attaches the validated session context to `req.auth`;
 * controllers read it through `AuthedRequest`.
 */

import type { Request } from "express";

/** Minimal, safe user profile returned to the Console. */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

export interface AuthSessionContext {
  sessionId: string;
  user: AuthUser;
}

export interface AuthedRequest extends Request {
  auth?: AuthSessionContext;
}
