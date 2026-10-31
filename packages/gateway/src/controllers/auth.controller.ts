/**
 * HTTP handlers for the auth flow.
 *
 * Controllers own request/response concerns only — cookies, redirects,
 * status codes — and delegate to services:
 *
 *   GET  /auth/google            -> start the Google Authorization Code flow
 *   GET  /auth/google/callback   -> validate callback, login-only lookup, session
 *   GET  /auth/me                -> validated session -> safe profile
 *   GET  /auth/providers         -> provider availability for the sign-in UI
 *   POST /auth/logout            -> revoke session, clear cookie
 *
 * Redirects after the callback are plain 302s to allowlisted internal paths:
 * authorization codes and session tokens never appear in URLs, and nothing
 * sensitive is ever logged.
 */

import type { Request, Response } from "express";
import { env } from "../env.ts";
import { isAuthError, safeErrorDescription } from "../errors.ts";
import {
  readSessionToken,
  sessionMetadata,
} from "../middleware/auth.middleware.ts";
import { completeLogin } from "../services/auth.service.ts";
import {
  createAuthorizationRequest,
  exchangeCode,
} from "../services/google-oauth.service.ts";
import {
  buildRedirectTarget,
  DEFAULT_POST_LOGIN_REDIRECT,
  resolveCallbackOrigin,
  resolveInitiatingOrigin,
  sanitizeRedirectPath,
} from "../services/redirect.service.ts";
import {
  revokeSession,
  SESSION_COOKIE_NAME,
  touchSession,
} from "../services/session.service.ts";
import type { AuthedRequest } from "../types.ts";

/** httpOnly cookie holding the single-use OAuth state + PKCE + nonce. */
const OAUTH_STATE_COOKIE = "splic_auth_state";

/** httpOnly cookie holding the validated post-login redirect target. */
const OAUTH_REDIRECT_COOKIE = "splic_auth_redirect";

/** Lifetime of the in-flight OAuth cookies (matches the previous 10 min). */
const OAUTH_COOKIE_MAX_AGE_MS = 600_000;

const OAUTH_COOKIE_PATH = "/auth/google/callback";

interface OAuthStateCookie {
  state: string;
  nonce: string;
  codeVerifier: string;
}

interface OAuthRedirectCookie {
  origin: string;
  path: string;
}

function baseCookieOptions(req: Request) {
  // `SameSite=None` requires `Secure`; behind TLS-terminating proxies `req.secure`
  // relies on `app.set("trust proxy", 1)`. In HTTPS production environments, `Secure` is enabled.
  const isHttps =
    req.secure ||
    req.protocol === "https" ||
    req.headers["x-forwarded-proto"] === "https";
  const isProduction = process.env.NODE_ENV === "production";
  const secure =
    isHttps ||
    (isProduction && !req.hostname.includes("localhost")) ||
    env.cookie.sameSite === "none";

  return {
    httpOnly: true,
    secure,
    sameSite: env.cookie.sameSite,
    domain: env.cookie.domain,
  };
}

function setSessionCookie(req: Request, res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    ...baseCookieOptions(req),
    path: "/",
    maxAge: env.sessionTtlSeconds * 1000,
  });
}

function clearSessionCookie(req: Request, res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, { ...baseCookieOptions(req), path: "/" });
}

function clearOAuthCookies(req: Request, res: Response): void {
  res.clearCookie(OAUTH_STATE_COOKIE, {
    ...baseCookieOptions(req),
    path: OAUTH_COOKIE_PATH,
  });
  res.clearCookie(OAUTH_REDIRECT_COOKIE, {
    ...baseCookieOptions(req),
    path: OAUTH_COOKIE_PATH,
  });
}

/** `{siteOrigin}/auth?error=<code>&redirect=<path>` — error handback. */
function siteErrorUrl(origin: string, code: string, redirectPath: string): string {
  const url = new URL("/auth", origin);
  url.searchParams.set("error", code);
  url.searchParams.set("redirect", redirectPath);
  return url.href;
}

function parseStateCookie(raw: unknown): OAuthStateCookie | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 4096) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<OAuthStateCookie>;
    if (
      typeof parsed.state !== "string" ||
      parsed.state.length === 0 ||
      typeof parsed.nonce !== "string" ||
      parsed.nonce.length === 0 ||
      typeof parsed.codeVerifier !== "string" ||
      parsed.codeVerifier.length === 0
    ) {
      return null;
    }
    return {
      state: parsed.state,
      nonce: parsed.nonce,
      codeVerifier: parsed.codeVerifier,
    };
  } catch {
    return null;
  }
}

function parseRedirectCookie(raw: unknown): OAuthRedirectCookie | null {
  if (typeof raw !== "string" || raw.length === 0 || raw.length > 4096) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<OAuthRedirectCookie>;
    if (typeof parsed.origin !== "string" || typeof parsed.path !== "string") {
      return null;
    }
    return { origin: parsed.origin, path: parsed.path };
  } catch {
    return null;
  }
}

/** `GET /auth/google` — initiate the Google Authorization Code flow. */
export async function startGoogle(req: Request, res: Response): Promise<void> {
  const redirectPath = sanitizeRedirectPath(req.query.redirect);
  const targetOrigin = resolveInitiatingOrigin(req);

  if (!env.google.configured) {
    // Microsoft/Google credentials missing: honest, configured-state error
    // using the site's existing error copy — no partially-built flow.
    res.redirect(302, siteErrorUrl(targetOrigin, "auth_not_configured", redirectPath));
    return;
  }

  let authorization;
  try {
    authorization = await createAuthorizationRequest();
  } catch (error) {
    console.error(
      "[auth] google authorization start failed:",
      safeErrorDescription(error),
    );
    const code = isAuthError(error) ? error.code : "auth_failed";
    res.redirect(302, siteErrorUrl(targetOrigin, code, redirectPath));
    return;
  }

  const cookieOptions = {
    ...baseCookieOptions(req),
    path: OAUTH_COOKIE_PATH,
    maxAge: OAUTH_COOKIE_MAX_AGE_MS,
  };
  // Single-use CSRF state bound to this browser together with the PKCE
  // verifier and OIDC nonce; scoped to the callback path.
  res.cookie(
    OAUTH_STATE_COOKIE,
    JSON.stringify({
      state: authorization.state,
      nonce: authorization.nonce,
      codeVerifier: authorization.codeVerifier,
    }),
    cookieOptions,
  );
  // Post-login destination (already allowlisted; re-validated at callback).
  res.cookie(
    OAUTH_REDIRECT_COOKIE,
    JSON.stringify({ origin: targetOrigin, path: redirectPath }),
    cookieOptions,
  );

  res.redirect(302, authorization.url);
}

/** `GET /auth/google/callback` — validate, resolve identity, authenticate. */
export async function googleCallback(req: Request, res: Response): Promise<void> {
  // Consume the one-time cookies first: whatever happens below, they are
  // cleared and the flow cannot be replayed.
  const storedState = parseStateCookie(req.cookies?.[OAUTH_STATE_COOKIE]);
  const storedRedirect = parseRedirectCookie(
    req.cookies?.[OAUTH_REDIRECT_COOKIE],
  );
  clearOAuthCookies(req, res);

  const targetOrigin = resolveCallbackOrigin(storedRedirect?.origin);
  const redirectPath = storedRedirect
    ? sanitizeRedirectPath(storedRedirect.path)
    : DEFAULT_POST_LOGIN_REDIRECT;
  const fail = (code: string): void => {
    res.redirect(302, siteErrorUrl(targetOrigin, code, redirectPath));
  };

  // Provider-driven failures: cancelled consent (`access_denied`) or any
  // other provider error. Only well-formed provider codes are logged.
  const providerError =
    typeof req.query.error === "string" ? req.query.error : undefined;
  if (providerError) {
    const safeCode = /^[a-z_]{1,64}$/.test(providerError)
      ? providerError
      : "unknown_error";
    console.warn(`[auth] google callback returned error: ${safeCode}`);
    fail(safeCode === "access_denied" ? "access_denied" : "auth_failed");
    return;
  }

  const code = typeof req.query.code === "string" ? req.query.code : undefined;
  const state =
    typeof req.query.state === "string" ? req.query.state : undefined;

  if (!code || !state) {
    fail("auth_failed");
    return;
  }
  if (!storedState || storedState.state !== state) {
    // Missing/expired/replayed state cookie — CSRF protection.
    fail("auth_state_mismatch");
    return;
  }

  try {
    // Built from `GATEWAY_PUBLIC_URL` so the derived token-request
    // `redirect_uri` matches the one registered at Google exactly.
    const callbackUrl = new URL(req.originalUrl, env.gatewayPublicUrl);
    const identity = await exchangeCode(callbackUrl, {
      expectedState: state,
      expectedNonce: storedState.nonce,
      pkceCodeVerifier: storedState.codeVerifier,
    });

    // Login-only: resolves an *existing* user via oauth_accounts(sub) or
    // throws `account_not_registered` — this route never creates users.
    const session = await completeLogin("google", identity.sub, sessionMetadata(req));

    setSessionCookie(req, res, session.token);
    res.redirect(302, buildRedirectTarget(targetOrigin, redirectPath));
  } catch (error) {
    if (isAuthError(error)) {
      fail(error.code);
      return;
    }
    // Database or unexpected failure: log safely, hand back a generic error.
    console.error("[auth] google callback failed:", safeErrorDescription(error));
    fail("auth_failed");
  }
}

/** `GET /auth/me` — current authenticated user's safe profile. */
export function me(req: AuthedRequest, res: Response): void {
  const auth = req.auth;
  if (!auth) {
    // requireSession always answers first; this is defense in depth.
    res.status(401).json({ authenticated: false });
    return;
  }
  touchSession(auth.sessionId);
  res.status(200).json({ authenticated: true, user: auth.user });
}

/** `GET /auth/providers` — public provider availability for the sign-in UI. */
export function providers(_req: Request, res: Response): void {
  res.status(200).json({
    providers: [
      {
        id: "google",
        name: "Google",
        configured: env.google.configured,
      },
      {
        // Deferred: Microsoft credentials are not configured, so the
        // frontend keeps the button on its existing disabled path and no
        // Microsoft flow is ever initiated from the website.
        id: "microsoft",
        name: "Microsoft",
        configured: false,
      },
    ],
  });
}

/** `POST /auth/logout` — revoke the current session and clear the cookie. */
export async function logout(req: Request, res: Response): Promise<void> {
  const token = readSessionToken(req);
  if (token) {
    try {
      await revokeSession(token);
    } catch (error) {
      // Revocation must succeed before we claim logout; the cookie stays so
      // the client can retry rather than silently appearing signed out.
      console.error("[auth] logout revoke failed:", safeErrorDescription(error));
      res.status(503).json({ error: "storage_unavailable" });
      return;
    }
  }
  clearSessionCookie(req, res);
  res.status(204).end();
}
