/**
 * Post-login redirect allowlisting.
 *
 * After a successful callback the browser is sent back to the frontend with
 * a plain 302 — never with tokens or codes in the URL. The destination is
 * restricted to an allowlist of *internal* paths on a *configured* site
 * origin:
 *
 * - the path must start with a single `/` (no `//host`, no absolute URLs),
 *   contain no backslashes, no `..` segments, and no control characters;
 * - the origin must be one of `SITE_ORIGINS`.
 *
 * Values are validated when the flow starts **and again at the callback**,
 * so a tampered redirect cookie can never produce an open redirect.
 */

import { env, isSiteOrigin } from "../env.ts";

/** Safe default destination after sign-in. */
export const DEFAULT_POST_LOGIN_REDIRECT = "/console";

const MAX_REDIRECT_LENGTH = 512;
/** Internal, same-origin path: leading `/` but not `//` or `/\\`. */
const INTERNAL_PATH_PATTERN = /^\/(?!\/)/;

/** C0 control characters (0x00-0x1f) and DEL (0x7f). */
function hasControlCharacters(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code < 32 || code === 127) return true;
  }
  return false;
}

/**
 * Sanitize a candidate redirect into an allowlisted internal path.
 * Anything that does not qualify falls back to the default.
 */
export function sanitizeRedirectPath(value: unknown): string {
  if (typeof value !== "string") return DEFAULT_POST_LOGIN_REDIRECT;

  let candidate = value.trim();
  try {
    // Decode once so %-encoded traversal/backslash sequences are inspected.
    candidate = decodeURIComponent(candidate);
  } catch {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }

  if (!candidate || candidate.length > MAX_REDIRECT_LENGTH) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }
  if (!INTERNAL_PATH_PATTERN.test(candidate)) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }
  if (candidate.includes("\\") || candidate.includes("..")) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }
  if (hasControlCharacters(candidate)) {
    return DEFAULT_POST_LOGIN_REDIRECT;
  }
  return candidate;
}

/**
 * Origin used to send the browser back after the callback: the origin that
 * initiated the flow when it is a configured site origin, otherwise the
 * first configured one.
 */
export function resolveInitiatingOrigin(req: {
  headers: { origin?: string | undefined; referer?: string | undefined };
}): string {
  const headerOrigin = req.headers.origin;
  if (headerOrigin && isSiteOrigin(headerOrigin)) {
    return headerOrigin.replace(/\/+$/, "");
  }

  const referer = req.headers.referer;
  if (referer) {
    try {
      const origin = new URL(referer).origin;
      if (isSiteOrigin(origin)) return origin;
    } catch {
      // fall through to the default
    }
  }

  return env.siteOrigins[0] ?? "http://localhost:3000";
}

/** Validate a stored origin again at callback time. */
export function resolveCallbackOrigin(storedOrigin: unknown): string {
  if (typeof storedOrigin === "string" && isSiteOrigin(storedOrigin)) {
    return storedOrigin.replace(/\/+$/, "");
  }
  return env.siteOrigins[0] ?? "http://localhost:3000";
}

/** `{siteOrigin}{path}` — the final 302 target after a successful login. */
export function buildRedirectTarget(origin: string, path: string): string {
  return `${origin}${path}`;
}
