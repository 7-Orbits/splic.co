import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { AUTH_SESSION_COOKIE } from "@/lib/auth/providers";
import { isSessionTokenValid } from "@/lib/auth/session";
import { getAuthProviderSummaries } from "@/lib/auth/providers";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE)?.value;

  const authenticated = isSessionTokenValid(token);
  const providers = getAuthProviderSummaries();

  return NextResponse.json({ authenticated, providers });
}
