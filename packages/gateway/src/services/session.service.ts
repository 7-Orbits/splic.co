/**
 * Database-backed application sessions.
 *
 * A session is an opaque, 256-bit random token delivered to the browser in
 * the `splic_auth_session` HttpOnly cookie. Only its SHA-256 digest is
 * stored — in `auth_sessions.refresh_token_hash` (bytea, unique), exactly as
 * the existing schema intends:
 *
 * - the unique digest index identifies exactly one session per token;
 * - `expires_at` bounds the lifetime (`AUTH_SESSION_TTL_SECONDS`, 7 days by
 *   default — required because the column is NOT NULL);
 * - `revoked_at` gives server-side logout/revocation;
 * - `user_agent` / `ip_address` / `last_used_at` provide audit fields.
 *
 * Presenting the cookie proves possession; validation additionally requires
 * a live row whose user is still active, so revocation takes effect
 * immediately at the Gateway.
 */

import { createHash, randomBytes } from "node:crypto";
import { getPool } from "../db/pool.ts";
import { env } from "../env.ts";
import { safeErrorDescription } from "../errors.ts";
import type { AuthUser } from "../types.ts";

export const SESSION_COOKIE_NAME = "splic_auth_session";

export interface IssuedSession {
  token: string;
  expiresAt: Date;
}

export interface SessionContext {
  sessionId: string;
  user: AuthUser;
}

export interface SessionMetadata {
  userAgent: string | null;
  ipAddress: string | null;
}

function hashToken(token: string): Buffer {
  return createHash("sha256").update(token, "utf8").digest();
}

interface SessionRow {
  session_id: string;
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
}

/**
 * Create a session row for an already-authenticated user and return the raw
 * token (the only time the plaintext value exists outside the client).
 */
export async function issueSession(
  userId: string,
  metadata: SessionMetadata,
): Promise<IssuedSession> {
  const pool = getPool();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + env.sessionTtlSeconds * 1000);

  // Bounded audit retention: sessions that expired over 30 days ago are
  // useless (validation requires expires_at > now) and get purged here.
  try {
    await pool.query(
      `DELETE FROM auth_sessions WHERE expires_at < now() - interval '30 days'`,
    );
  } catch (error) {
    console.error("[session] purge failed:", safeErrorDescription(error));
  }

  await pool.query(
    `INSERT INTO auth_sessions (user_id, refresh_token_hash, expires_at, user_agent, ip_address)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId, tokenHash, expiresAt, metadata.userAgent, metadata.ipAddress],
  );

  return { token, expiresAt };
}

/**
 * Validate a presented session token. Returns `null` for missing, expired,
 * revoked, or orphaned sessions and for users that are no longer active;
 * throws only on database failures (caller maps those to 503).
 */
export async function getSessionContext(
  token: string,
): Promise<SessionContext | null> {
  const result = await getPool().query<SessionRow>(
    `SELECT s.id AS session_id, u.id, u.email, u.display_name, u.avatar_url
       FROM auth_sessions s
       JOIN users u ON u.id = s.user_id
      WHERE s.refresh_token_hash = $1
        AND s.revoked_at IS NULL
        AND s.expires_at > now()
        AND u.status = 'active'
        AND u.deleted_at IS NULL`,
    [hashToken(token)],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    sessionId: row.session_id,
    user: {
      id: row.id,
      email: row.email,
      name: row.display_name,
      avatarUrl: row.avatar_url,
    },
  };
}

/** Server-side logout: revoke the session. Idempotent; token hash only. */
export async function revokeSession(token: string): Promise<void> {
  await getPool().query(
    `UPDATE auth_sessions
        SET revoked_at = now()
      WHERE refresh_token_hash = $1
        AND revoked_at IS NULL`,
    [hashToken(token)],
  );
}

/**
 * Refresh `last_used_at`, throttled to one write per 5 minutes so `/auth/me`
 * polling stays cheap. Fire-and-forget: a failed touch never affects the
 * response.
 */
export function touchSession(sessionId: string): void {
  getPool()
    .query(
      `UPDATE auth_sessions
          SET last_used_at = now()
        WHERE id = $1
          AND (last_used_at IS NULL OR last_used_at < now() - interval '5 minutes')`,
      [sessionId],
    )
    .catch((error: unknown) => {
      console.error("[session] touch failed:", safeErrorDescription(error));
    });
}
