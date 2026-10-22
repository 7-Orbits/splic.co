import type { MouseEventHandler, ReactNode } from "react";

interface CtaProps {
  children: ReactNode;
  /** Omit to render an honest, non-interactive pending state. */
  href?: string;
  variant?: "primary" | "ghost";
  external?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement | HTMLButtonElement>;
  ariaLabel?: string;
}

export function Cta({
  children,
  href,
  variant = "primary",
  external = false,
  className = "",
  onClick,
  ariaLabel,
}: CtaProps) {
  const classes = `btn inline-flex items-center justify-center gap-2 ${
    variant === "primary" ? "btn-primary" : "btn-ghost"
  } ${className}`.trim();

  if (!href) {
    return (
      <button
        type="button"
        className={classes}
        disabled
        aria-label={ariaLabel}
        title="Not available yet — Splic is still in development"
      >
        {children}
      </button>
    );
  }

  if (external) {
    return (
      <a
        href={href}
        className={classes}
        onClick={onClick}
        aria-label={ariaLabel}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <a href={href} className={classes} onClick={onClick} aria-label={ariaLabel}>
      {children}
    </a>
  );
}
