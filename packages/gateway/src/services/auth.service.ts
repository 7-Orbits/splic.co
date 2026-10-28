/**
 * Authentication orchestration — shared by every future client surface.
 *
 * ## Why this shape
 *
 * The website Console is **login-only**: it authenticates *existing* Splic
 * users and can never create one. `completeLogin()` therefore performs two
 * steps only:
 *
 *   1. resolve the provider identity to an already-registered user
 *      (`user.service` — strict `oauth_accounts` link on the stable `sub`,
 *      never email matching);
 *   2. issue an application session (`session.service`).
 *
 * Any unregistered identity fails with `account_not_registered` *before* any
 * write happens — no `users` insert, no `oauth_accounts` link, no implicit
 * merge.
 *
 * ## Future desktop signup (not implemented here)
 *
 * The desktop application will add a separately authorized
 * `registerAndLogin()`-style entry point that (a) creates the `users` row and
 * the provider `oauth_accounts` row in one transaction, then (b) calls the
 * same `issueSession()` primitive below. Desktop and website then share this
 * identity lookup and session infrastructure, while the Console path stays
 * strictly read-only. That flow is deliberately deferred.
 */

import { AuthError } from "../errors.ts";
import {
  issueSession,
  type IssuedSession,
  type SessionMetadata,
} from "./session.service.ts";
import {
  findUserByProviderIdentity,
  type OAuthProvider,
} from "./user.service.ts";

export interface AuthenticatedSession extends IssuedSession {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
  };
}

/**
 * Complete login for a *verified* provider identity.
 *
 * @param provider - OAuth provider that authenticated the identity.
 * @param providerAccountId - the provider's stable identifier (`sub`).
 * @param metadata - audit fields for the session row.
 * @throws AuthError `account_not_registered` when the identity has no
 *   registered Splic user (Console never registers one), and
 *   `account_unavailable` when the linked user is suspended or deleted.
 */
export async function completeLogin(
  provider: OAuthProvider,
  providerAccountId: string,
  metadata: SessionMetadata,
): Promise<AuthenticatedSession> {
  const linked = await findUserByProviderIdentity(provider, providerAccountId);

  if (!linked) {
    // Login-only rule: verified identity, but no registered account — stop
    // before any write. Signup happens in the desktop application.
    throw new AuthError(
      "account_not_registered",
      "Google identity is not linked to a registered Splic user",
    );
  }

  if (!linked.isActive) {
    throw new AuthError(
      "account_unavailable",
      "Linked Splic user is not active",
    );
  }

  const session = await issueSession(linked.user.id, metadata);
  return { ...session, user: linked.user };
}
