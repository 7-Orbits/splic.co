import type { ReactNode } from "react";

interface SectionProps {
  id: string;
  /** Id of the heading that labels this section. */
  labelledBy: string;
  children: ReactNode;
  /** Render a raised surface background. */
  alt?: boolean;
  /** Override vertical padding (e.g. full-bleed CTA band). */
  padding?: "default" | "none" | "band";
  className?: string;
}

const paddingClasses: Record<NonNullable<SectionProps["padding"]>, string> = {
  default: "py-8 md:py-12 lg:py-16",
  none: "",
  band: "py-8 md:py-12 lg:py-16",
};

export function Section({
  id,
  labelledBy,
  children,
  alt = false,
  padding = "default",
  className = "",
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={`${paddingClasses[padding]} ${alt ? "bg-surface-raised" : ""} ${className}`}
    >
      {children}
    </section>
  );
}
