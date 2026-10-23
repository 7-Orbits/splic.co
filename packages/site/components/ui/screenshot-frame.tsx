import Image from "next/image";
import type { ReactNode } from "react";

interface ScreenshotFrameProps {
  /** Image source. When omitted, renders the illustrative placeholder. */
  src?: string;
  alt?: string;
  width?: number;
  height?: number;
  /** Load eagerly (hero / above the fold). */
  priority?: boolean;
  caption?: ReactNode;
  /** Visible status label, e.g. "Illustrative". */
  label?: string;
  /** Custom children rendered inside the frame (mockups, diagrams). */
  children?: ReactNode;
  className?: string;
  /** Aspect ratio for reserved space, e.g. "16 / 10". */
  aspect?: string;
}

/**
 * Screenshot container: 1px border, 14px radius, frame shadow, reserved
 * aspect ratio. When no `src` and no `children` are provided it renders an
 * inset placeholder with a visible label — never a blank frame.
 */
export function ScreenshotFrame({
  src,
  alt,
  width = 1440,
  height = 900,
  priority = false,
  caption,
  label,
  children,
  className = "",
  aspect,
}: ScreenshotFrameProps) {
  return (
    <figure data-reveal="" className={`w-full ${className}`}>
      <div
        className="glass-frame relative overflow-hidden rounded-xl"
        style={aspect ? { aspectRatio: aspect } : undefined}
      >
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-10 h-px bg-linear-to-r from-transparent via-text-primary/20 to-transparent"
        />
        {src ? (
          <Image
            src={src}
            alt={alt ?? ""}
            width={width}
            height={height}
            priority={priority}
            className="h-full w-full object-cover"
            {...(priority ? { fetchPriority: "high" as const } : {})}
          />
        ) : (
          children ?? (
            <div className="flex h-full min-h-[200px] w-full items-center justify-center p-8">
              <p className="text-md uppercase tracking-[0.14em] text-text-tertiary">
                Screenshot coming soon
              </p>
            </div>
          )
        )}
        {label ? (
          <span className="glass-chip absolute bottom-3 left-3 rounded-full border border-border-default px-2.5 py-1 text-md text-text-secondary">
            {label}
          </span>
        ) : null}
      </div>
      {caption ? (
        <figcaption className="mt-4 text-md text-text-tertiary">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
