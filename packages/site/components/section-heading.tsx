import type { ReactNode } from "react";

interface SectionHeadingProps {
  id: string;
  eyebrow: string;
  title: ReactNode;
  description?: ReactNode;
  align?: "left" | "center";
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeadingProps) {
  const centered = align === "center";

  return (
    <div
      className={
        centered
          ? "flex flex-col items-center text-center"
          : "flex flex-col items-start"
      }
    >
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id} className="headline mt-4 text-3xl text-text-primary">
        {title}
      </h2>
      {description ? (
        <p className="lede mt-5 max-w-2xl text-lg">{description}</p>
      ) : null}
    </div>
  );
}
