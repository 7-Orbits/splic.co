import Image from "next/image";

interface WordmarkProps {
  /** Append the .co handle, as used in the footer. */
  withHandle?: boolean;
  markSize?: number;
  className?: string;
}

export function Wordmark({
  withHandle = false,
  markSize = 18,
  className = "",
}: WordmarkProps) {
  const markWidth = Math.round(markSize * (134 / 150));

  return (
    <span
      className={`inline-flex items-center gap-2 select-none leading-none ${className}`}
    >
      <span className="flex shrink-0 items-center justify-center">
        <Image
          src="/splic-mark.png"
          alt=""
          width={134}
          height={150}
          priority
          className="shrink-0 object-contain"
          style={{ width: markWidth, height: markSize }}
        />
      </span>
      <span className="text-[15px] font-medium tracking-tight text-text-primary">
        {withHandle ? (
          <>
            splic<span className="text-text-tertiary">.co</span>
          </>
        ) : (
          "Splic"
        )}
      </span>
    </span>
  );
}
