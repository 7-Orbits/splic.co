"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { FormField } from "./form-field";
import type { ConsoleAccount } from "@/lib/console/types";

interface SettingsFormProps {
  account: ConsoleAccount;
}

interface Errors {
  name?: string;
}

export function SettingsForm({ account }: SettingsFormProps) {
  const [name, setName] = useState(account.name);
  const [errors, setErrors] = useState<Errors>({});
  const [message, setMessage] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);

    const nextErrors: Errors = {};
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      nextErrors.name = "Enter at least 2 characters.";
    } else if (trimmed.length > 60) {
      nextErrors.name = "Use 60 characters or fewer.";
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setMessage(
      "Preview only — the profile was validated but no changes were saved.",
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <div className="flex flex-col gap-5">
        <FormField
          id="display-name"
          label="Display name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          error={errors.name}
          hint="Shown in the Console sidebar."
        />
        <FormField
          id="email"
          label="Email address"
          type="email"
          value={account.email}
          readOnly
          hint="Managed by your sign-in provider in a connected Console."
        />
      </div>

      <div className="mt-5 flex flex-col gap-3 border-t border-border-subtle pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-text-tertiary">
          Saving is disabled in this preview. The form validates input only.
        </p>
        <Button type="submit" size="sm">
          Save changes
        </Button>
      </div>

      <div aria-live="polite" className="mt-3">
        {message ? (
          <p className="rounded-md border border-accent-secondary/30 bg-accent-secondary/[0.06] px-3 py-2 text-sm text-text-primary">
            {message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
