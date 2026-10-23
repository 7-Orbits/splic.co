import type { ReactNode } from "react";

interface PanelProps {
  children: ReactNode;
  className?: string;
  tone?: "base" | "raised";
}

export function Panel({ children, className = "", tone = "base" }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-border-subtle shadow-[inset_0_1px_0_rgba(255,255,255,0.035)] ${
        tone === "raised" ? "bg-surface-raised" : "bg-surface-primary"
      } ${className}`}
    >
      {children}
    </section>
  );
}
