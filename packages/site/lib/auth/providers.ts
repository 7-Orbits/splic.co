/**
 * OAuth provider wiring for the Splic sign-in / sign-up flow.
 *
 * Splic supports two identity providers today: Google and Microsoft. Both
 * flows are authorization-code based and share a single consent screen, so
 * one start-and-callback mechanism serves sign-in and sign-up.
 */

export const AUTH_PROVIDERS = ["google", "microsoft"] as const;

export type AuthProviderId = (typeof AUTH_PROVIDERS)[number];

export interface AuthProviderSummary {
  id: AuthProviderId;
  name: string;
  configured: boolean;
  clientIdEnv: string;
  clientSecretEnv: string;
}

export interface AuthProviderConfig {
  id: AuthProviderId;
  name: string;
  authorizeUrl: string;
  tokenUrl: string;
  scopes: string[];
  /** Environment variable holding the OAuth client id. */
  clientIdEnv: string;
  /** Environment variable holding the OAuth client secret (server-side only). */
  clientSecretEnv: string;
  /** OAuth tenant segment (Microsoft multi-tenant default). */
  tenant: string;
}

export const authProviderConfigs: Record<AuthProviderId, AuthProviderConfig> = {
  google: {
    id: "google",
    name: "Google",
    authorizeUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scopes: ["openid", "email", "profile"],
    clientIdEnv: "GOOGLE_CLIENT_ID",
    clientSecretEnv: "GOOGLE_CLIENT_SECRET",
    tenant: "common",
  },
  microsoft: {
    id: "microsoft",
    name: "Microsoft",
    authorizeUrl: "https://login.microsoftonline.com/common/oauth2/v2/authorize",
    tokenUrl: "https://login.microsoftonline.com/common/oauth2/v2.0/token",
    scopes: ["openid", "email", "profile"],
    clientIdEnv: "MICROSOFT_CLIENT_ID",
    clientSecretEnv: "MICROSOFT_CLIENT_SECRET",
    tenant: "common",
  },
};

/** httpOnly cookie holding the single-use OAuth state for CSRF protection. */
export const AUTH_STATE_COOKIE = "splic_auth_state";

/** httpOnly cookie holding the validated post-auth redirect target. */
export const AUTH_REDIRECT_COOKIE = "splic_auth_redirect";

/** httpOnly cookie holding the issued session token. */
export const AUTH_SESSION_COOKIE = "splic_auth_session";

/** Lifetime of the single-use OAuth state cookie (CSRF token). */
export const AUTH_STATE_MAX_AGE_SECONDS = 600;

/** Lifetime of the post-auth redirect cookie. */
export const AUTH_REDIRECT_MAX_AGE_SECONDS = 600;

/** Safe default destination after a successful sign-in / sign-up. */
export const DEFAULT_AUTH_REDIRECT = "/console";

export function getAuthProvider(id: string): AuthProviderConfig | null {
  const key = typeof id === "string" ? id.trim().toLowerCase() : "";
  const providerId = AUTH_PROVIDERS.find((candidate) => candidate === key);
  if (!providerId) return null;
  return authProviderConfigs[providerId];
}

/** All supported providers with their configuration status. */
export function getAuthProviderSummaries(
  env: Record<string, string | undefined> = process.env,
): AuthProviderSummary[] {
  return AUTH_PROVIDERS.map((id) => {
    const provider = authProviderConfigs[id];
    return {
      id,
      name: provider.name,
      configured: isAuthProviderConfigured(id, env),
      clientIdEnv: provider.clientIdEnv,
      clientSecretEnv: provider.clientSecretEnv,
    };
  });
}

/** True when both the OAuth client id and client secret are present. */
export function isAuthProviderConfigured(
  id: string,
  env: Record<string, string | undefined> = process.env,
): boolean {
  const provider = getAuthProvider(id);
  if (!provider) return false;
  const clientId = env[provider.clientIdEnv];
  const clientSecret = env[provider.clientSecretEnv];
  return Boolean(clientId && clientSecret);
}

export interface BuildAuthorizeUrlOptions {
  /** OAuth redirect URI registered with the provider (callback endpoint). */
  redirectUri: string;
  /** Single-use state token issued by the sign-in endpoint. */
  state: string;
  scope?: string;
}

/**
 * Build the provider authorization URL. Requires a configured client id.
 * Returns null when the provider credentials are not configured.
 */
export function buildAuthorizeUrl(
  provider: AuthProviderConfig,
  options: BuildAuthorizeUrlOptions,
): string | null {
  const clientId = process.env[provider.clientIdEnv];
  if (!clientId) return null;

  const authorizeUrl = new URL(provider.authorizeUrl);
  authorizeUrl.searchParams.set("client_id", clientId);
  authorizeUrl.searchParams.set("redirect_uri", options.redirectUri);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("scope", options.scope ?? provider.scopes.join(" "));
  authorizeUrl.searchParams.set("state", options.state);
  if (provider.id === "microsoft") {
    authorizeUrl.searchParams.set("tenant", provider.tenant);
  }

  return authorizeUrl.toString();
}

/** Generate a cryptographically random, URL-safe single-use state token. */
export function createStateToken(): string {
  const bytes = new Uint8Array(32);
  globalThis.crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

/** Human-readable copy for known OAuth error codes. */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  access_denied: "Sign-in was cancelled or denied.",
  auth_failed: "We couldn't complete sign-in. Please try again.",
  auth_state_mismatch: "Sign-in couldn't be verified. Please try again.",
  auth_not_configured:
    "Sign-in isn't configured yet. Please try again later.",
};

/** Map an OAuth error code (or fallback) to concise auth copy. */
export function authErrorMessage(
  code: string | null | undefined,
): string | null {
  if (!code) return null;
  const normalized = code.trim().toLowerCase();
  if (normalized in AUTH_ERROR_MESSAGES) return AUTH_ERROR_MESSAGES[normalized];
  return "Sign-in couldn't be completed. Please try again.";
}
