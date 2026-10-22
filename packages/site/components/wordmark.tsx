import Image from "next/image";

interface WordmarkProps {
  /** Append the .co handle, as used in the footer. */
  withHandle?: boolean;
  markSize?: number;
}

export function Wordmark({ withHandle = false, markSize = 18 }: WordmarkProps) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <Image
        src="/splic-mark.png"
        alt=""
        width={134}
        height={150}
        className="w-auto"
        style={{ height: markSize }}
      />
      <span className="text-2xl tracking-[-0.01em] text-text-primary">
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
