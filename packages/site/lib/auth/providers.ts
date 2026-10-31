/**
 * Shared auth constants, provider summaries, and error copy for the
 * Gateway-owned sign-in flow.
 *
 * The Gateway (`packages/gateway`) owns all OAuth processing: this site only
 * navigates the browser to `GET /auth/google`, reads the session through
 * credentialed `GET /auth/me`, and posts `POST /auth/logout`. It never
 * exchanges codes, holds provider credentials, or creates accounts — the
 * website Console is login-only and new accounts are created in the Splic
 * desktop application (future).
 */

import { getAuthErrorInfo } from "./errors";

export {
  getAuthErrorInfo,
  type AuthErrorCode,
  type AuthErrorInfo,
  type AuthToastVariant,
} from "./errors";

export const AUTH_PROVIDERS = ["google", "microsoft"] as const;

export type AuthProviderId = (typeof AUTH_PROVIDERS)[number];

export interface AuthProviderSummary {
  id: AuthProviderId;
  name: string;
  /** Whether the Gateway can start this provider's flow right now. */
  configured: boolean;
}

/** Safe user profile returned by the Gateway's `GET /auth/me`. */
export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

/** httpOnly session cookie issued by the Gateway (validated by the Gateway). */
export const AUTH_SESSION_COOKIE = "splic_auth_session";

/** Safe default destination after a successful sign-in. */
export const DEFAULT_AUTH_REDIRECT = "/console";

/**
 * Gateway base URL for both browser calls (`credentials: "include"`) and the
 * server-side `/console` proxy check. Keep the cookie host and this origin in
 * sync; the Gateway allows these origins via `SITE_ORIGIN` CORS.
 */
export function gatewayUrl(): string {
  const configured = (
    process.env.NEXT_PUBLIC_GATEWAY_URL ??
    process.env.GATEWAY_URL ??
    ""
  )
    .trim()
    .replace(/\/+$/, "");
  return configured || "http://localhost:3010";
}

/**
 * Server-rendered fallback summaries so both provider buttons exist in the
 * first paint; the live `GET /auth/providers` response from the Gateway
 * overrides them. Microsoft is deferred (credentials not configured), so it
 * renders through the existing disabled state and never starts a flow.
 */
export function getAuthProviderSummaries(): AuthProviderSummary[] {
  return [
    { id: "google", name: "Google", configured: true },
    { id: "microsoft", name: "Microsoft", configured: false },
  ];
}

/** Map an OAuth/auth error code (or fallback) to concise auth copy. */
export function authErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  const info = getAuthErrorInfo(code);
  return info?.description ?? null;
}
