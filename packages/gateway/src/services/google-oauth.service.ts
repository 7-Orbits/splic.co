/**
 * Google OAuth 2.0 / OpenID Connect client.
 *
 * Authorization Code Flow with PKCE (S256) for a server-side web
 * application, built on `openid-client` (v6 — maintained, OpenID-certified).
 * The library performs discovery, the code exchange, and full ID-token
 * validation (signature against Google's JWKS, issuer, audience, expiry, and
 * nonce). No OAuth cryptography is implemented here.
 *
 * Only `openid`, `email`, and `profile` scopes are requested. Provider
 * access/refresh tokens are never stored: identity comes exclusively from
 * the validated ID token's stable `sub` claim.
 */

import {
  authorizationCodeGrant,
  buildAuthorizationUrl,
  calculatePKCECodeChallenge,
  discovery,
  randomNonce,
  randomPKCECodeVerifier,
  randomState,
  type Configuration,
} from "openid-client";
import { env } from "../env.ts";
import { AuthError, safeErrorDescription } from "../errors.ts";

export interface AuthorizationRequest {
  /** Fully-formed Google authorization URL to redirect the browser to. */
  url: string;
  state: string;
  nonce: string;
  codeVerifier: string;
}

export interface GoogleIdentity {
  /** Google's stable, per-account identifier — the permanent identity key. */
  sub: string;
  email?: string;
  emailVerified?: boolean;
  name?: string;
  picture?: string;
}

let configPromise: Promise<Configuration> | undefined;

/** Lazily discover Google's OIDC metadata; cached, retryable after failure. */
function getClientConfig(): Promise<Configuration> {
  if (!configPromise) {
    const { clientId, clientSecret, issuer } = env.google;
    configPromise = discovery(new URL(issuer), clientId!, clientSecret!).catch(
      (error: unknown) => {
        configPromise = undefined;
        throw error;
      },
    );
  }
  return configPromise;
}

function requireConfigured(): void {
  if (!env.google.configured) {
    throw new AuthError(
      "auth_not_configured",
      "Google OAuth credentials are not configured",
    );
  }
}

/**
 * Build a fresh authorization request: single-use `state` (CSRF), `nonce`
 * (ID-token replay binding), and a PKCE verifier/challenge pair. The caller
 * must persist all three values until the callback returns.
 */
export async function createAuthorizationRequest(): Promise<AuthorizationRequest> {
  requireConfigured();
  const config = await getClientConfig();

  const codeVerifier = randomPKCECodeVerifier();
  const codeChallenge = await calculatePKCECodeChallenge(codeVerifier);
  const state = randomState();
  const nonce = randomNonce();

  const url = buildAuthorizationUrl(config, {
    redirect_uri: env.google.redirectUri,
    scope: env.google.scopes,
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return { url: url.href, state, nonce, codeVerifier };
}

/**
 * Exchange the callback's authorization code and return the verified
 * identity.
 *
 * `callbackUrl` must be the exact registered redirect URI (from
 * `env.gatewayPublicUrl`) plus the query string: the library derives the
 * token request's `redirect_uri` from it and validates `state`, PKCE, and
 * `nonce` there. Any failure — expired/used code, state mismatch, invalid
 * signature, wrong issuer/audience, missing claims — surfaces as
 * `auth_failed` without leaking provider details.
 */
export async function exchangeCode(
  callbackUrl: URL,
  checks: {
    expectedState: string;
    expectedNonce: string;
    pkceCodeVerifier: string;
  },
): Promise<GoogleIdentity> {
  requireConfigured();
  const config = await getClientConfig();

  let tokens;
  try {
    tokens = await authorizationCodeGrant(config, callbackUrl, {
      expectedState: checks.expectedState,
      expectedNonce: checks.expectedNonce,
      pkceCodeVerifier: checks.pkceCodeVerifier,
      idTokenExpected: true,
    });
  } catch (error) {
    console.error("[auth] google code exchange failed:", safeErrorDescription(error));
    throw new AuthError("auth_failed", "Google authorization code exchange failed");
  }

  const claims = tokens.claims();
  if (!claims || typeof claims.sub !== "string" || claims.sub.length === 0) {
    throw new AuthError("auth_failed", "ID token is missing the sub claim");
  }

  // Access/refresh tokens are intentionally discarded here — Splic does not
  // call Google APIs, so they must never be persisted.
  return {
    sub: claims.sub,
    email: typeof claims.email === "string" ? claims.email : undefined,
    emailVerified:
      claims.email_verified === true || claims.email_verified === "true",
    name: typeof claims.name === "string" ? claims.name : undefined,
    picture: typeof claims.picture === "string" ? claims.picture : undefined,
  };
}
