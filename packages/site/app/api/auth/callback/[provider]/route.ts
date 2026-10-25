import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_REDIRECT_COOKIE,
  AUTH_SESSION_COOKIE,
  AUTH_STATE_COOKIE,
  DEFAULT_AUTH_REDIRECT,
  getAuthProvider,
} from "@/lib/auth/providers";
import { safeAuthRedirect } from "@/lib/auth/redirect";
import { encodeSessionToken } from "@/lib/auth/session";

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await context.params;
  const provider = getAuthProvider(providerId);
  const requestUrl = new URL(request.url);

  const fail = (error: string) =>
    NextResponse.redirect(
      new URL(`/auth?error=${encodeURIComponent(error)}`, requestUrl.origin),
    );

  if (!provider) {
    return fail("auth_unavailable");
  }

  const error = requestUrl.searchParams.get("error");
  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");

  const cookieStore = await cookies();
  const storedState = cookieStore.get(AUTH_STATE_COOKIE)?.value;
  const redirectTo = safeAuthRedirect(
    cookieStore.get(AUTH_REDIRECT_COOKIE)?.value,
    DEFAULT_AUTH_REDIRECT,
  );
  cookieStore.delete(AUTH_STATE_COOKIE);
  cookieStore.delete(AUTH_REDIRECT_COOKIE);

  // Provider-driven failures (user denial, provider errors, …) land here.
  if (error) {
    return fail(error);
  }

  if (!code || !state || storedState !== state) {
    return fail("auth_state_mismatch");
  }

  const clientId = process.env[provider.clientIdEnv];
  const clientSecret = process.env[provider.clientSecretEnv];
  if (!clientId || !clientSecret) {
    return fail("auth_not_configured");
  }

  const redirectUri = `${requestUrl.origin}/api/auth/callback/${provider.id}`;
  const tokenResponse = await fetch(provider.tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    }).toString(),
  });

  const token = (await tokenResponse.json().catch(() => null)) as
    | TokenResponse
    | null;

  if (!tokenResponse.ok || !token?.access_token) {
    return fail("auth_failed");
  }

  const now = Date.now();
  const sessionToken = encodeSessionToken({
    accessToken: token.access_token,
    providerId: provider.id,
    issuedAt: now,
    // `expires_in` is seconds; the session token and validation compare
    // millisecond epoch values (see lib/auth/session.ts).
    expiresAt: now + (token.expires_in ?? 3600) * 1000,
  });

  const response = NextResponse.redirect(
    new URL(redirectTo, requestUrl.origin),
  );
  response.cookies.set({
    name: AUTH_SESSION_COOKIE,
    value: sessionToken,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: Math.max(60, (token.expires_in ?? 3600) - 30),
    secure: requestUrl.protocol === "https:",
  });

  return response;
}
