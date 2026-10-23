import type { ReactNode } from "react";
import { Button } from "./button";

export type StateBlockKind = "loading" | "empty" | "error" | "unavailable";

interface StateBlockProps {
  kind: StateBlockKind;
  title: string;
  description?: ReactNode;
  /** Optional retry action for error states. */
  retry?: { label: string; onClick?: () => void; href?: string };
  /** Optional next action for empty/unavailable states. */
  action?: { label: string; href?: string };
  children?: ReactNode;
  className?: string;
}

/**
 * Region for loading, empty, error and unavailable states. Blocking failures
 * use role="alert"; non-blocking regions use aria-live="polite".
 */
export function StateBlock({
  kind,
  title,
  description,
  retry,
  action,
  children,
  className = "",
}: StateBlockProps) {
  const isAlert = kind === "error";

  return (
    <div
      data-reveal=""
      className={`glass rounded-lg p-8 text-center md:p-12 ${className}`}
      {...(isAlert
        ? { role: "alert" }
        : kind === "loading"
          ? { "aria-busy": true as const }
          : { "aria-live": "polite" as const })}
    >
      <h3 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">
        {title}
      </h3>
      {description ? (
        <p className="mx-auto mt-3 max-w-[480px] text-md text-text-secondary">
          {description}
        </p>
      ) : null}
      {children}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        {retry ? (
          <Button
            variant="secondary"
            {...(retry.href
              ? { href: retry.href }
              : { onClick: retry.onClick ?? (() => {}) })}
          >
            {retry.label}
          </Button>
        ) : null}
        {action?.href ? <Button href={action.href}>{action.label}</Button> : null}
      </div>
    </div>
  );
}
