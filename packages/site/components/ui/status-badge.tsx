import type { ReactNode } from "react";

export type BadgeTone = "neutral" | "ok" | "warn" | "error" | "accent" | "info";

interface StatusBadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-border-default text-text-secondary",
  ok: "border-accent-success/40 text-accent-success",
  warn: "border-accent-warning/40 text-accent-warning",
  error: "border-accent-error/40 text-accent-error",
  accent: "border-accent-primary/50 text-accent-primary",
  info: "border-accent-secondary/40 text-accent-secondary",
};

/**
 * Small pill status label. Colour is never the only signal; the label text
 * always states the status.
 */
export function StatusBadge({
  children,
  tone = "neutral",
  className = "",
}: StatusBadgeProps) {
  return (
    <span
      className={`glass-pill inline-flex items-center rounded-full border px-2.5 py-0.5 text-md font-medium ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
