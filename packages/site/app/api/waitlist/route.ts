import { NextResponse } from "next/server";

/**
 * Same-origin waitlist endpoint. Validates and normalizes on this layer,
 * then forwards to the gateway, which owns the database write. Storage
 * failures surface honestly as 503 — the client only shows success after a
 * confirmed created / already_registered response.
 */

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

interface SignupFields {
  name?: string;
  email?: string;
}

function validate(body: unknown): {
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

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const { name, email, fields } = validate(payload);
  if (Object.keys(fields).length > 0) {
    return NextResponse.json(
      { error: "validation_failed", fields },
      { status: 400 },
    );
  }

  const gatewayUrl = process.env.GATEWAY_URL?.trim();
  if (!gatewayUrl) {
    console.error("[waitlist] GATEWAY_URL is not set");
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }

  try {
    const upstream = await fetch(new URL("/v1/waitlist", gatewayUrl), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
      signal: AbortSignal.timeout(8_000),
    });
    const data = (await upstream.json().catch(() => null)) as
      | { error?: string; fields?: SignupFields; status?: string }
      | null;

    if (upstream.ok) {
      // 201 created | 200 already_registered — both are confirmed storage.
      return NextResponse.json(
        data ?? { status: "unknown" },
        { status: upstream.status },
      );
    }
    if (upstream.status === 400) {
      return NextResponse.json(
        data ?? { error: "validation_failed" },
        { status: 400 },
      );
    }
    // 5xx / 503 from the gateway: never acknowledge without storage.
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  } catch (error) {
    console.error("[waitlist] gateway unreachable:", error);
    return NextResponse.json({ error: "storage_unavailable" }, { status: 503 });
  }
}
