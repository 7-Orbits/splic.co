/**
 * Types and user-friendly error mappings for Splic authentication.
 *
 * Emitted error codes from the Gateway or current flow are mapped to safe,
 * structured titles, descriptions, and toast variants. Raw error details,
 * provider payloads, and stack traces are never exposed to the user.
 */

export type AuthErrorCode =
  | "account_not_registered"
  | "access_denied"
  | "auth_failed"
  | "auth_state_mismatch"
  | "auth_not_configured"
  | "account_unavailable"
  | "session_expired";

export type AuthToastVariant = "error" | "info" | "warning";

export interface AuthErrorInfo {
  title: string;
  description: string;
  variant: AuthToastVariant;
}

const AUTH_ERROR_MAP: Record<AuthErrorCode, AuthErrorInfo> = {
  account_not_registered: {
    title: "Account not registered",
    description:
      "This Google account isn't registered with Splic yet. Sign-up will be available in the Splic desktop app.",
    variant: "error",
  },
  access_denied: {
    title: "Sign-in cancelled",
    description: "Google authentication was cancelled.",
    variant: "info",
  },
  session_expired: {
    title: "Session expired",
    description: "Session expired; please sign in again.",
    variant: "warning",
  },
  auth_failed: {
    title: "Authentication failed",
    description: "Authentication failed; please try again.",
    variant: "error",
  },
  auth_state_mismatch: {
    title: "Verification failed",
    description: "Authentication could not be verified. Please try again.",
    variant: "error",
  },
  auth_not_configured: {
    title: "Sign-in unavailable",
    description: "Sign-in isn't configured yet. Please try again later.",
    variant: "error",
  },
  account_unavailable: {
    title: "Account unavailable",
    description: "This Splic account is currently unavailable.",
    variant: "error",
  },
};

const DEFAULT_AUTH_ERROR: AuthErrorInfo = {
  title: "Authentication failed",
  description: "Authentication failed; please try again.",
  variant: "error",
};

/**
 * Returns safe, user-facing error details for a given error code.
 * Always falls back to a generic, safe error message for unknown codes,
 * preventing exposure of raw server messages or sensitive tokens.
 */
export function getAuthErrorInfo(
  code: string | null | undefined,
): AuthErrorInfo | null {
  if (!code) return null;
  const normalized = code.trim().toLowerCase() as AuthErrorCode;
  if (normalized in AUTH_ERROR_MAP) {
    return AUTH_ERROR_MAP[normalized];
  }
  return DEFAULT_AUTH_ERROR;
}
