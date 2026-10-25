/**
 * Safe redirect handling for the auth flow.
 *
 * After a successful OAuth sign-in the user is returned to an intended
 * destination. Only internal, same-origin paths are accepted; anything else
 * falls back to the default console route.
 */

import { DEFAULT_AUTH_REDIRECT } from "./providers";

const SAFE_PATH_PATTERN = /^\/(?!\/)/;

/** Return the redirect target only when it is an internal safe path. */
export function safeAuthRedirect(
  value: string | null | undefined,
  fallback: string = DEFAULT_AUTH_REDIRECT,
): string {
  const candidate = typeof value === "string" ? value.trim() : "";
  if (!candidate) return fallback;
  if (!SAFE_PATH_PATTERN.test(candidate)) return fallback;
  const segments = candidate.split("/").filter(Boolean);
  if (segments.some((segment) => segment === "..")) return fallback;
  if (candidate.includes("\\")) return fallback;
  return candidate;
}
