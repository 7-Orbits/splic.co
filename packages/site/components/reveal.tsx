import type { ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Optional delay in milliseconds before the reveal starts. */
  delay?: number;
  className?: string;
}

/**
 * Marks its children for the GSAP scroll reveal. Without JS (or with reduced
 * motion) the content stays fully visible.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <div
      data-reveal=""
      data-reveal-delay={delay || undefined}
      className={className}
    >
      {children}
    </div>
  );
}
