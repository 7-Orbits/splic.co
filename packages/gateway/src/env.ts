import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../../.env") });

const issues: string[] = [];

function read(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readPositiveInt(name: string, fallback: number): number {
  const raw = read(name);
  if (!raw) return fallback;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    issues.push(
      `${name} must be a positive integer (seconds); using default ${fallback}.`,
    );
    return fallback;
  }
  return parsed;
}

const port = readPositiveInt("PORT", 3010);

const defaultSiteOrigins = ["http://localhost:3000", "https://splic.com"];
const rawSiteOrigins = read("SITE_ORIGIN") ?? read("SITE_ORIGINS");
const siteOrigins = (
  rawSiteOrigins
    ? rawSiteOrigins.split(",")
    : defaultSiteOrigins
)
  .map((origin) => origin.trim().replace(/\/+$/, ""))
  .filter(Boolean);
if (siteOrigins.length === 0) {
  siteOrigins.push(...defaultSiteOrigins);
}

const databaseUrl = read("DATABASE_URL");
if (!databaseUrl) {
  issues.push("DATABASE_URL is not set — storage-backed endpoints will return 503.");
}

/**
 * Public origin of this Gateway. Used verbatim to build the OAuth
 * `redirect_uri`, so it must match the URI registered at Google exactly
 * (scheme + host + port, no trailing slash).
 */
const gatewayPublicUrl = (
  read("GATEWAY_PUBLIC_URL") ?? `http://localhost:${port}`
).replace(/\/+$/, "");

const googleClientId = read("GOOGLE_CLIENT_ID");
const googleClientSecret = read("GOOGLE_CLIENT_SECRET");
if (!googleClientId) {
  issues.push(
    "GOOGLE_CLIENT_ID is not set — Google sign-in will be unavailable. " +
      "Required variable name: GOOGLE_CLIENT_ID.",
  );
}
if (!googleClientSecret) {
  issues.push(
    "GOOGLE_CLIENT_SECRET is not set — Google sign-in will be unavailable. " +
      "Required variable name: GOOGLE_CLIENT_SECRET.",
  );
}

/**
 * Session cookie lifetime. The schema requires `auth_sessions.expires_at`;
 * logout and `POST /auth/logout` revoke sessions earlier via `revoked_at`.
 */
const sessionTtlSeconds = readPositiveInt("AUTH_SESSION_TTL_SECONDS", 604_800);

/** Optional cookie Domain (e.g. `.splic.co`) shared by site and Gateway hosts. */
const cookieDomain = read("AUTH_COOKIE_DOMAIN") ?? undefined;

const sameSiteRaw = (read("AUTH_COOKIE_SAMESITE") ?? "lax").toLowerCase();
const allowedSameSite = ["lax", "strict", "none"] as const;
if (!allowedSameSite.includes(sameSiteRaw as (typeof allowedSameSite)[number])) {
  issues.push(
    `AUTH_COOKIE_SAMESITE must be one of lax | strict | none; using "lax".`,
  );
}
const cookieSameSite =
  allowedSameSite.includes(sameSiteRaw as (typeof allowedSameSite)[number])
    ? (sameSiteRaw as (typeof allowedSameSite)[number])
    : "lax";

export const env = Object.freeze({
  port,
  siteOrigins,
  databaseUrl,
  gatewayPublicUrl,
  sessionTtlSeconds,
  cookie: Object.freeze({
    domain: cookieDomain,
    sameSite: cookieSameSite,
  }),
  google: Object.freeze({
    clientId: googleClientId,
    clientSecret: googleClientSecret,
    configured: Boolean(googleClientId && googleClientSecret),
    /** OIDC issuer identifier; discovery validates metadata against it. */
    issuer: "https://accounts.google.com",
    redirectUri: `${gatewayPublicUrl}/auth/google/callback`,
    scopes: "openid email profile",
  }),
});

/** Human-readable startup issues (variable names only, never values). */
export const envIssues: readonly string[] = Object.freeze([...issues]);

export function reportEnvIssues(log: (message: string) => void = console.error): void {
  for (const issue of envIssues) {
    log(`[env] ${issue}`);
  }
}

/** True when `origin` is one of the configured frontend origins. */
export function isSiteOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;
  return siteOrigins.includes(origin.trim().replace(/\/+$/, ""));
}
