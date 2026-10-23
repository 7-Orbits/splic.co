import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
  /** Render as the page H1 instead of H2. */
  asPageHeading?: boolean;
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
  asPageHeading = false,
}: SectionHeadingProps) {
  const centered = align === "center";
  const Heading = asPageHeading ? "h1" : "h2";

  return (
    <div
      data-reveal=""
      className={
        centered
          ? "flex flex-col items-center text-center"
          : "flex flex-col items-start"
      }
    >
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Heading
        id={id}
        className={`headline text-text-primary ${
          asPageHeading ? "mt-3 text-page" : "mt-4 text-section"
        }`}
        style={{
          letterSpacing: asPageHeading ? "-0.03em" : "-0.025em",
        }}
      >
        {title}
      </Heading>
      {description ? (
        <p className={`lede mt-5 ${centered ? "max-w-[640px]" : "prose-page"}`}>
          {description}
        </p>
      ) : null}
    </div>
  );
}
