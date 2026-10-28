/**
 * Server-side Console gate (Next 16 `proxy` convention, replacing the
 * deprecated `middleware.ts`).
 *
 * Runs for every `/console/*` request: the Gateway-issued session cookie is
 * validated by calling the Gateway's `GET /auth/me` (server-to-server,
 * forwarding only that cookie). The Gateway checks the opaque (unsigned)
 * token by digest against `auth_sessions` — expiry, revocation, and user
 * status — so a forged, expired, revoked, or orphaned cookie can never pass;
 * the previous local decode of an unsigned cookie is gone. If the Gateway is
 * unreachable, the Console stays closed rather than rendering unauthenticated.
 */

import { NextResponse, type NextRequest } from "next/server";
import { AUTH_SESSION_COOKIE, gatewayUrl } from "@/lib/auth/providers";
import { safeAuthRedirect } from "@/lib/auth/redirect";

/** Extract a single cookie from a raw Cookie header. */
function readSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  for (const part of cookieHeader.split(";")) {
    const separator = part.indexOf("=");
    if (separator === -1) continue;
    const name = part.slice(0, separator).trim();
    if (name === AUTH_SESSION_COOKIE) {
      const value = part.slice(separator + 1).trim();
      return value ? value : null;
    }
  }
  return null;
}

async function isAuthenticated(cookieHeader: string | null): Promise<boolean> {
  const token = readSessionCookie(cookieHeader);
  if (!token) return false;

  try {
    const response = await fetch(`${gatewayUrl()}/auth/me`, {
      headers: { cookie: `${AUTH_SESSION_COOKIE}=${token}` },
      cache: "no-store",
    });
    if (!response.ok) return false;
    const data = (await response.json().catch(() => null)) as {
      authenticated?: boolean;
    } | null;
    return data?.authenticated === true;
  } catch {
    // Gateway unreachable: fail closed (Console stays gated).
    return false;
  }
}

export default async function proxy(request: NextRequest) {
  if (await isAuthenticated(request.headers.get("cookie"))) {
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
