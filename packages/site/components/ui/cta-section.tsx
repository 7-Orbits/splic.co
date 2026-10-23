import type { ReactNode } from "react";
import { AmbientGlow } from "./ambient-glow";
import { Button } from "./button";

interface CtaAction {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
}

interface CtaSectionProps {
  id?: string;
  heading: ReactNode;
  supporting?: ReactNode;
  primary: CtaAction;
  secondary?: CtaAction;
  className?: string;
}

/**
 * Full-width closing call-to-action band on a raised surface. Buttons stack
 * under 640px.
 */
export function CtaSection({
  id = "cta",
  heading,
  supporting,
  primary,
  secondary,
  className = "",
}: CtaSectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-heading`}
      className={`relative isolate overflow-clip bg-surface-raised py-8 md:py-12 lg:py-16 ${className}`}
    >
      <AmbientGlow variant="bottom-corners" opacity={0.6} />
      <div className="container-page relative flex flex-col items-center text-center">
        <h2
          id={`${id}-heading`}
          data-reveal=""
          className="headline max-w-[720px] text-section text-text-primary"
          style={{ letterSpacing: "-0.025em" }}
        >
          {heading}
        </h2>
        {supporting ? (
          <p data-reveal="" className="lede mt-5 max-w-[560px]">
            {supporting}
          </p>
        ) : null}
        <div
          data-reveal=""
          className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
        >
          <Button href={primary.href} size="lg" className="w-full sm:w-auto">
            {primary.label}
          </Button>
          {secondary ? (
            <Button
              href={secondary.href}
              variant={secondary.variant ?? "secondary"}
              size="lg"
              className="w-full sm:w-auto"
            >
              {secondary.label}
            </Button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
