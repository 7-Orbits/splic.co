/**
 * Session token contract for the Splic auth flow.
 *
 * After a successful OAuth authorization-code exchange, the callback issues a
 * session token (carrying the provider access token) as an httpOnly cookie.
 * Tokens are structured, base64url-encoded values so expiry can be validated
 * without a round trip; presence alone is never trusted as proof of session.
 */

export interface AuthSessionToken {
  /** Provider access token used for authorized console API calls. */
  accessToken: string;
  providerId: string;
  issuedAt: number;
  expiresAt: number;
}

function encodeJson(value: AuthSessionToken): string {
  const json = JSON.stringify(value);
  const base64 =
    typeof btoa === "function"
      ? btoa(json)
      : Buffer.from(json, "utf8").toString("base64");
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function decodeJson(value: string): AuthSessionToken | null {
  try {
    const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const json = decodeURIComponent(
      atob(padded)
        .split("")
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join(""),
    );
    const parsed = JSON.parse(json) as Partial<AuthSessionToken>;
    if (!parsed || typeof parsed.accessToken !== "string") return null;
    const issuedAt = Number(parsed.issuedAt ?? Date.now());
    const expiresAt = Number(parsed.expiresAt ?? 0);
    if (!Number.isFinite(issuedAt) || !Number.isFinite(expiresAt)) return null;
    return {
      accessToken: parsed.accessToken,
      providerId: typeof parsed.providerId === "string" ? parsed.providerId : "unknown",
      issuedAt,
      expiresAt,
    };
  } catch {
    return null;
  }
}

/** Encode a session token into a cookie-safe value. */
export function encodeSessionToken(session: AuthSessionToken): string {
  return encodeJson(session);
}

/** Decode and shape-check a session token cookie value. */
export function decodeSessionToken(
  value: string | null | undefined,
): AuthSessionToken | null {
  if (!value) return null;
  const session = decodeJson(value);
  if (!session) return null;
  if (!Number.isFinite(session.expiresAt) || session.expiresAt <= session.issuedAt) {
    return null;
  }
  return session;
}

/**
 * Validate a session token: must decode and must not be expired.
 * Never trust token presence alone.
 */
export function isSessionTokenValid(
  token: string | null | undefined,
  now: number = Date.now(),
): boolean {
  const session = decodeSessionToken(token);
  if (!session) return false;
  return session.expiresAt > now;
}
