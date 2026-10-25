/**
 * Server-side Console gate (Next 16 `proxy` convention, replacing the
 * deprecated `middleware.ts`).
 *
 * Runs at the edge for every `/console/*` request: a structurally valid,
 * unexpired session cookie is required before the Console renders. Direct
 * URL entry cannot bypass authentication, and an expired or malformed token
 * is treated exactly like no token at all.
 */

import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/providers";
import { isSessionTokenValid } from "@/lib/auth/session";
import { safeAuthRedirect } from "@/lib/auth/redirect";

export default function proxy(request: NextRequest) {
  const sessionToken = request.cookies.get(AUTH_SESSION_COOKIE)?.value;

  if (isSessionTokenValid(sessionToken)) {
    return NextResponse.next();
  }

  const authUrl = new URL("/auth", request.url);
  // Preserve the intended destination so the user returns to the Console
  // (or the exact Console page) after signing in.
  authUrl.searchParams.set(
    "redirect",
    safeAuthRedirect(`${request.nextUrl.pathname}${request.nextUrl.search}`),
  );
  return NextResponse.redirect(authUrl);
}

export const config = {
  matcher: ["/console/:path*"],
};
