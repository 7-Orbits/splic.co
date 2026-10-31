/**
 * Safe error plumbing for the auth flow.
 *
 * `AuthError.code` values are the only error detail ever sent to the
 * frontend: they map 1:1 to the site's `authErrorMessage()` copy in
 * `packages/site/lib/auth/providers.ts`. Provider responses, tokens,
 * authorization codes, and stack traces never leave the Gateway.
 */

export type AuthErrorCode =
  /** User cancelled/declined consent, or the provider returned `access_denied`. */
  | "access_denied"
  /** Any unverifiable callback: bad state, failed code exchange, missing claims. */
  | "auth_failed"
  /** `state` missing, expired, unknown, or replayed (CSRF protection). */
  | "auth_state_mismatch"
  /** Google credentials are not configured on the Gateway. */
  | "auth_not_configured"
  /** Identity verified but no registered Splic user is linked — Console is login-only. */
  | "account_not_registered"
  /** Linked user exists but is suspended or deleted. */
  | "account_unavailable";

export class AuthError extends Error {
  readonly code: AuthErrorCode;

  constructor(code: AuthErrorCode, message?: string) {
    super(message ?? code);
    this.name = "AuthError";
    this.code = code;
  }
}

export function isAuthError(error: unknown): error is AuthError {
  return error instanceof AuthError;
}

/** Query parameters whose values must never appear in logs. */
const SENSITIVE_PARAM_PATTERN =
  /([?&](?:code|state|nonce|session_state|authuser|access_token|refresh_token|id_token|client_secret)=)[^&\s"']+/gi;

/**
 * Render an error for server-side logs: name + message with OAuth-sensitive
 * query parameter values redacted. Never logs request URLs or credentials.
 */
export function safeErrorDescription(error: unknown): string {
  if (isAuthError(error)) {
    return `AuthError(${error.code})`;
  }
  if (error instanceof Error) {
    const text = `${error.name}: ${error.message}`;
    return text.replace(SENSITIVE_PARAM_PATTERN, "$1[redacted]");
  }
  return "unknown error";
}
