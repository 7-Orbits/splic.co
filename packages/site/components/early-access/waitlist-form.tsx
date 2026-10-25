"use client";

import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CircleCheck, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Waitlist registration form for /early-access. Validates on the client,
 * submits through the same-origin /api/waitlist route, and swaps itself for
 * the green confirmation screen only after a confirmed 201 (created) or 200
 * (already_registered) response — storage failures surface as inline errors,
 * never as a false success. This is a waitlist signup, not an account: no
 * email is sent here because no email service is configured.
 */

// Mirrors the server-side rules in app/api/waitlist/route.ts and the gateway.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_NAME_LENGTH = 100;
const MAX_EMAIL_LENGTH = 254;

interface FieldErrors {
  name?: string;
  email?: string;
}

function validate(name: string, email: string): FieldErrors {
  const errors: FieldErrors = {};
  const trimmedName = name.trim();
  const trimmedEmail = email.trim().toLowerCase();

  if (!trimmedName) {
    errors.name = "Enter your name.";
  } else if (trimmedName.length > MAX_NAME_LENGTH) {
    errors.name = `Name must be ${MAX_NAME_LENGTH} characters or fewer.`;
  }

  if (!trimmedEmail) {
    errors.email = "Enter your email address.";
  } else if (
    trimmedEmail.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(trimmedEmail)
  ) {
    errors.email = "Enter a valid email address.";
  }

  return errors;
}

interface WaitlistResponse {
  error?: string;
  fields?: FieldErrors;
  status?: string;
}

export function WaitlistForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  // Set only from a confirmed created / already_registered response.
  const [confirmedEmail, setConfirmedEmail] = useState<string | null>(null);

  const nameRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const successRef = useRef<HTMLDivElement>(null);

  // Keep focus from dropping to <body> when the form unmounts.
  useEffect(() => {
    if (confirmedEmail) successRef.current?.focus();
  }, [confirmedEmail]);

  function clearFieldError(field: keyof FieldErrors) {
    setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting || confirmedEmail) return;

    const errors = validate(name, email);
    setFieldErrors(errors);
    setFormError(null);
    if (errors.name) {
      nameRef.current?.focus();
      return;
    }
    if (errors.email) {
      emailRef.current?.focus();
      return;
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    setSubmitting(true);

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, email: normalizedEmail }),
      });

      if (response.status === 201 || response.status === 200) {
        const data = (await response.json().catch(() => null)) as
          | WaitlistResponse
          | null;
        if (
          data?.status === "created" ||
          data?.status === "already_registered"
        ) {
          setConfirmedEmail(normalizedEmail);
          return;
        }
      }

      if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as
          | WaitlistResponse
          | null;
        const serverFields = data?.fields ?? {};
        const nextErrors: FieldErrors = {
          ...(serverFields.name ? { name: serverFields.name } : {}),
          ...(serverFields.email ? { email: serverFields.email } : {}),
        };
        if (nextErrors.name || nextErrors.email) {
          setFieldErrors(nextErrors);
          (nextErrors.name ? nameRef : emailRef).current?.focus();
          return;
        }
        setFormError("Check your name and email, then try again.");
        return;
      }

      // 5xx / 503 storage_unavailable: honest failure, never a fake success.
      setFormError(
        "We couldn't save your signup right now. Please try again in a moment.",
      );
    } catch {
      setFormError(
        "We couldn't reach Splic right now. Check your connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmedEmail) {
    return (
      <div
        ref={successRef}
        role="status"
        tabIndex={-1}
        className="waitlist-success auth-enter mt-8 flex flex-col items-center text-center"
      >
        <CircleCheck
          aria-hidden="true"
          className="h-10 w-10 text-accent-success-strong"
          strokeWidth={1.75}
        />
        <h2 className="mt-4 text-2xl font-semibold tracking-[-0.02em] text-accent-success-strong">
          You&apos;re on the list!
        </h2>
        <p className="mt-3 text-md leading-[1.6] text-text-secondary">
          Thanks for your interest in Splic. We&apos;ll send an email to{" "}
          <span className="text-text-primary">{confirmedEmail}</span> when
          we&apos;re ready to launch.
        </p>
        <p className="mt-2 text-sm leading-[1.6] text-text-tertiary">
          Keep an eye on your inbox.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-1.5 text-[13px] text-text-secondary underline underline-offset-4 transition-colors hover:text-text-primary focus-visible:text-text-primary"
        >
          Back to Splic
        </Link>
      </div>
    );
  }

  return (
    <>
      {/* Standalone page exit, mirroring /auth's fixed back link. Hidden once
          the success screen shows its own "Back to Splic" link. */}
      <Link
        href="/"
        className="fixed left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[13px] text-text-secondary transition-colors hover:text-text-primary focus-visible:text-text-primary"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back to Splic
      </Link>

      <form
        onSubmit={handleSubmit}
        noValidate
        aria-busy={submitting}
        className="auth-enter mt-8 flex w-full flex-col gap-4 text-left"
      >
        <div>
          <label
            htmlFor="waitlist-name"
            className="block text-md font-medium text-text-primary"
          >
            Name
          </label>
          <input
            ref={nameRef}
            id="waitlist-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder="Ada Lovelace"
            value={name}
            disabled={submitting}
            onChange={(event) => {
              setName(event.target.value);
              if (fieldErrors.name) clearFieldError("name");
            }}
            aria-invalid={fieldErrors.name ? true : undefined}
            aria-describedby={fieldErrors.name ? "waitlist-name-error" : undefined}
            className="glass-field mt-2 block w-full rounded-md px-3 py-2 text-md text-text-primary"
          />
          {fieldErrors.name ? (
            <p
              id="waitlist-name-error"
              role="alert"
              className="mt-1.5 text-[13px] leading-[1.5] text-accent-error"
            >
              {fieldErrors.name}
            </p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="waitlist-email"
            className="block text-md font-medium text-text-primary"
          >
            Email address
          </label>
          <input
            ref={emailRef}
            id="waitlist-email"
            name="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            disabled={submitting}
            onChange={(event) => {
              setEmail(event.target.value);
              if (fieldErrors.email) clearFieldError("email");
            }}
            aria-invalid={fieldErrors.email ? true : undefined}
            aria-describedby={
              fieldErrors.email ? "waitlist-email-error" : undefined
            }
            className="glass-field mt-2 block w-full rounded-md px-3 py-2 text-md text-text-primary"
          />
          {fieldErrors.email ? (
            <p
              id="waitlist-email-error"
              role="alert"
              className="mt-1.5 text-[13px] leading-[1.5] text-accent-error"
            >
              {fieldErrors.email}
            </p>
          ) : null}
        </div>

        {formError ? (
          <p role="alert" className="text-[13px] leading-[1.5] text-accent-error">
            {formError}
          </p>
        ) : null}

        <Button
          type="submit"
          variant="auth"
          className="w-full"
          disabled={submitting}
          aria-busy={submitting}
        >
          {submitting ? (
            <>
              <LoaderCircle
                aria-hidden="true"
                className="h-4 w-4 animate-spin"
              />
              <span>Join the waitlist</span>
            </>
          ) : (
            <span>Join the waitlist</span>
          )}
        </Button>
      </form>
    </>
  );
}
