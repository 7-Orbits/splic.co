/**
 * Splic Gateway — minimal HTTP API.
 *
 * Currently serves the early-access waitlist. Reads `DATABASE_URL` from the
 * repository-root `.env` (the same file `platform/drizzle/drizzle.config.ts`
 * uses) and writes to the canonical `platform/drizzle` schema. When the
 * database or the `waitlist_signups` table is unavailable, every submission
 * fails honestly with 503 — nothing is ever acknowledged without storage.
 */

import path from "node:path";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import express, {
  type ErrorRequestHandler,
  type Request,
  type Response,
} from "express";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.resolve(__dirname, "../../../.env") });

const PORT = Number(process.env.PORT ?? 4000);
const SITE_ORIGINS = (process.env.SITE_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 4000,
  idleTimeoutMillis: 10_000,
  max: 4,
});

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
app.use(express.json({ limit: "16kb" }));

// Same-origin in production; allow the configured site origins in dev.
app.use((req: Request, res: Response, next) => {
  const origin = req.headers.origin;
  if (origin && SITE_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  }
  if (req.method === "OPTIONS") {
    res.sendStatus(204);
    return;
  }
  next();
});

app.get("/healthz", (_req: Request, res: Response) => {
  res.json({ ok: true, database: process.env.DATABASE_URL ? "configured" : "missing" });
});

app.post("/v1/waitlist", async (_req: Request, res: Response) => {
  // express.json already ran; re-read the parsed body defensively.
  const { name, email, fields } = validateSignup(
    (_req as Request & { body?: unknown }).body,
  );
  if (Object.keys(fields).length > 0) {
    res.status(400).json({ error: "validation_failed", fields });
    return;
  }

  if (!process.env.DATABASE_URL) {
    console.error("[waitlist] DATABASE_URL is not set");
    res.status(503).json({ error: "storage_unavailable" });
    return;
  }

  try {
    const result = await pool.query(
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
    console.error("[waitlist] storage error:", error);
    res.status(503).json({ error: "storage_unavailable" });
  }
});

// JSON error responses (malformed body, body too large, unexpected failures).
const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof SyntaxError || (error as { type?: string }).type === "entity.parse.failed") {
    res.status(400).json({ error: "invalid_json" });
    return;
  }
  console.error("[gateway] unhandled error:", error);
  res.status(500).json({ error: "internal_error" });
};
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`[gateway] listening on http://localhost:${PORT}`);
});
