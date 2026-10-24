import type { CSSProperties, HTMLAttributes } from "react";

export type AmbientGlowVariant =
  | "lower-center"
  | "bottom-corners"
  | "top-center"
  | "side-left"
  | "side-right"
  | "center";

interface AmbientGlowProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "aria-hidden"> {
  variant: AmbientGlowVariant;
  /** Lower this when two glows overlap. */
  opacity?: number;
}

/**
 * Decorative white light behind a section. The parent must be
 * `relative isolate overflow-clip` so the layer never creates scroll.
 */
export function AmbientGlow({
  variant,
  opacity,
  className = "",
  style,
  ...rest
}: AmbientGlowProps) {
  const mergedStyle: CSSProperties = {
    ...(opacity !== undefined ? { opacity } : {}),
    ...style,
  };

  return (
    <div
      {...rest}
      aria-hidden="true"
      className={`ambient-light ambient-light--${variant} ${className}`}
      style={mergedStyle}
    />
  );
}
