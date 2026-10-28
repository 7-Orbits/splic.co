/**
 * Registered-user lookups (read-only).
 *
 * ## Login-only contract (website Console)
 *
 * A Google identity counts as a *registered Splic account* only when
 * `oauth_accounts` already links `(provider = 'google',
 * provider_account_id = <Google sub>)` to an existing `users` row. This
 * module never inserts, never links, and never falls back to email
 * matching — an unregistered identity is reported as such so the caller can
 * reject the login.
 *
 * ## Future desktop signup
 *
 * The desktop application will own user creation (separately authorized):
 * it must insert the `users` row **and** the matching `oauth_accounts` row
 * in one transaction, then reuse `session.issueSession()` from
 * `auth.service.ts`. Nothing in this module (or in the Console path) may
 * ever create accounts.
 */

import { getPool } from "../db/pool.ts";
import type { AuthUser } from "../types.ts";

export type OAuthProvider = "google";

/** Row describing an identity link plus its owning user. */
export interface LinkedUserRecord {
  user: AuthUser;
  /** `status = 'active'` and not soft-deleted. */
  isActive: boolean;
}

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  status: string;
  deleted_at: Date | null;
}

/**
 * Look up the user linked to a provider identity.
 *
 * Returns `null` when no `oauth_accounts` row exists for the identity —
 * i.e. the Google account has never been registered with Splic.
 */
export async function findUserByProviderIdentity(
  provider: OAuthProvider,
  providerAccountId: string,
): Promise<LinkedUserRecord | null> {
  const result = await getPool().query<UserRow>(
    `SELECT u.id, u.email, u.display_name, u.avatar_url, u.status, u.deleted_at
       FROM oauth_accounts oa
       JOIN users u ON u.id = oa.user_id
      WHERE oa.provider = $1
        AND oa.provider_account_id = $2`,
    [provider, providerAccountId],
  );

  const row = result.rows[0];
  if (!row) return null;

  return {
    user: {
      id: row.id,
      email: row.email,
      name: row.display_name,
      avatarUrl: row.avatar_url,
    },
    isActive: row.status === "active" && row.deleted_at === null,
  };
}
