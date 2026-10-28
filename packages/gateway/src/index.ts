/**
 * Splic Gateway — HTTP API.
 *
 * Serves the early-access waitlist and owns website authentication
 * (`/auth/*`: Google OAuth sign-in for *existing* Splic users — login-only,
 * never registration). Reads configuration through `env.ts` (repository-root
 * `.env`) and the canonical `platform/drizzle` schema over `pg`.
 *
 * Storage honesty is unchanged: when the database or a table is unavailable,
 * storage-backed submissions fail with 503 — nothing is acknowledged without
 * storage.
 */

import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import cookieParser from "cookie-parser";
import { getPool } from "./db/pool.ts";
import { env, reportEnvIssues } from "./env.ts";
import { safeErrorDescription } from "./errors.ts";
import { corsMiddleware } from "./middleware/cors.middleware.ts";
import authRoutes from "./routes/auth.routes.ts";

// Shared validation with the site's /api/waitlist route: normalize the email
// (trim + lowercase) exactly like the generated `email_normalized` column.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

interface SignupFields {
  name?: string;
  email?: string;
}

function validateSignup(body: unknown): {
  name: string;
  email: string;
  fields: SignupFields;
} {
  const record =
    body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const name = typeof record.name === "string" ? record.name.trim() : "";
  const email =
    typeof record.email === "string" ? record.email.trim().toLowerCase() : "";

  const fields: SignupFields = {};
  if (!name || name.length > MAX_NAME_LENGTH) {
    fields.name = "Enter your name (1–100 characters).";
  }
  if (!email || email.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(email)) {
    fields.email = "Enter a valid email address.";
  }
  return { name, email, fields };
}

const app = express();
app.disable("x-powered-by");
// One hop (load balancer / platform proxy) so `req.secure` and `req.ip`
// reflect the real client for cookie `Secure` flags and session auditing.
app.set("trust proxy", 1);
app.use(express.json({ limit: "16kb" }));
app.use(cookieParser());

// Central CORS middleware allowing configured site origins, handling preflight OPTIONS,
// and enabling credentials for session cookies.
app.use(corsMiddleware);

app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ ok: true, database: env.databaseUrl ? "configured" : "missing" });
});

app.use("/auth", authRoutes);

app.post("/v1/waitlist", async (_req: Request, res: Response) => {
  // express.json already ran; re-read the parsed body defensively.
  const { name, email, fields } = validateSignup(
    (_req as Request & { body?: unknown }).body,
  );
  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: "validation_failed", fields });
    return;
  }

  if (!env.databaseUrl) {
    console.error("[waitlist] DATABASE_URL is not set");
    res.status(503).json({ error: "storage_unavailable" });
    return;
  }

  try {
    const result = await getPool().query(
      `INSERT INTO waitlist_signups (name, email, source)
       VALUES ($1, $2, $3)
       ON CONFLICT (email_normalized) DO NOTHING
       RETURNING id`,
      [name, email, "site"],
    );
    if ((result.rowCount ?? 0) > 0) {
      res.status(201).json({ status: "created" });
      return;
    }
    // Unique violation on the normalized email: already registered.
    res.status(200).json({ status: "already_registered" });
  } catch (error) {
    // Covers "db down" and "table missing" (migration not applied).
    console.error("[waitlist] storage error:", safeErrorDescription(error));
    res.status(503).json({ error: "storage_unavailable" });
  }
});

// JSON error responses (malformed body, body too large, unexpected failures).
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError || (error as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ error: "invalid_json" });
    return;
  }
  console.error("[gateway] unhandled error:", safeErrorDescription(error));
  res.status(500).json({ error: "internal_error" });
};
app.use(errorHandler);

reportEnvIssues();
app.listen(env.port, () => {
  console.log(`[gateway] listening on http://localhost:${env.port}`);
});
