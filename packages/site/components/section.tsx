import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  /** Id of the heading that labels this section. */
  labelledBy: string;
  children: ReactNode;
  /** Render a slightly raised background. */
  alt?: boolean;
  /** Remove the top hairline (use for the first section). */
  flush?: boolean;
  className?: string;
}

export function Section({
  id,
  labelledBy,
  children,
  alt = false,
  flush = false,
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`py-14 md:py-21 lg:py-28 ${
        flush ? "" : "border-t border-line"
      } ${alt ? "bg-surface-muted" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
