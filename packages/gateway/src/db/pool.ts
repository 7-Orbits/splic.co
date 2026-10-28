/**
 * Shared PostgreSQL pool for the Gateway.
 *
 * Uses the canonical `platform/drizzle` schema tables over plain `pg`
 * (matching the existing `/v1/waitlist` access style). The pool is created
 * lazily so a missing `DATABASE_URL` never crashes startup — storage-backed
 * endpoints surface `storage_unavailable` instead (see `/healthz`).
 */

import { Pool } from "pg";
import { env } from "../env.ts";

let pool: Pool | undefined;

export function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: env.databaseUrl,
      connectionTimeoutMillis: 4000,
      idleTimeoutMillis: 10_000,
      max: 4,
    });
  }
  return pool;
}
