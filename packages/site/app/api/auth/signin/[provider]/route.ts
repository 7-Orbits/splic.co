import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  AUTH_REDIRECT_COOKIE,
  AUTH_STATE_COOKIE,
  AUTH_REDIRECT_MAX_AGE_SECONDS,
  AUTH_STATE_MAX_AGE_SECONDS,
  buildAuthorizeUrl,
  createStateToken,
  getAuthProvider,
} from "@/lib/auth/providers";
import { safeAuthRedirect } from "@/lib/auth/redirect";

export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider: providerId } = await context.params;
  const provider = getAuthProvider(providerId);

  if (!provider) {
    return NextResponse.json({ error: "unknown_provider" }, { status: 404 });
  }

  const clientId = process.env[provider.clientIdEnv];
  const clientSecret = process.env[provider.clientSecretEnv];
  if (!clientId || !clientSecret) {
    return NextResponse.json(
      { error: "provider_not_configured", provider: providerId },
      { status: 503 },
    );
  }

  const requestUrl = new URL(request.url);
  const redirectTo = safeAuthRedirect(
    requestUrl.searchParams.get("redirect"),
  );

  // Issue a single-use state token for CSRF protection and remember the
  // validated post-auth destination until the callback completes.
  const state = createStateToken();
  const cookieStore = await cookies();
  const secure = requestUrl.protocol === "https:";
  cookieStore.set({
    name: AUTH_STATE_COOKIE,
    value: state,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_STATE_MAX_AGE_SECONDS,
    secure,
  });
  cookieStore.set({
    name: AUTH_REDIRECT_COOKIE,
    value: redirectTo,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: AUTH_REDIRECT_MAX_AGE_SECONDS,
    secure,
  });

  const redirectUri = `${requestUrl.origin}/api/auth/callback/${provider.id}`;
  const authorizeUrl = buildAuthorizeUrl(provider, { redirectUri, state });
  if (!authorizeUrl) {
    return NextResponse.json(
      { error: "provider_not_configured", provider: providerId },
      { status: 503 },
    );
  }

  return NextResponse.redirect(authorizeUrl);
}
