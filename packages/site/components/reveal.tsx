import type { CSSProperties, ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  /** Optional delay in milliseconds before the transition starts. */
  delay?: number;
  className?: string;
}

/**
 * Marks its children for the scroll reveal handled by the small inline
 * script in the root layout. Renders nothing client-side: without the
 * script (or with reduced motion) the content stays fully visible.
 */
export function Reveal({ children, delay = 0, className }: RevealProps) {
  return (
    <div
      data-reveal=""
      className={className}
      style={
        delay ? ({ "--reveal-delay": `${delay}ms` } as CSSProperties) : undefined
      }
    >
      {children}
    </div>
  );
}
