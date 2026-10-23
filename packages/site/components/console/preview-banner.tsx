import Link from "next/link";
import { FlaskConical } from "lucide-react";
import type { ConsolePreviewMeta } from "@/lib/console/types";

export function PreviewBanner({ preview }: { preview: ConsolePreviewMeta }) {
  return (
    <div className="border-b border-border-subtle bg-surface-raised/70">
      <div className="mx-auto flex max-w-[1180px] flex-col gap-2 px-5 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-7 lg:px-10">
        <div className="flex items-start gap-2.5">
          <FlaskConical
            aria-hidden="true"
            className="mt-0.5 h-4 w-4 shrink-0 text-accent-warning"
            strokeWidth={1.8}
          />
          <p className="text-sm leading-5 text-text-secondary">
            <span className="font-medium text-text-primary">
              Console preview.
            </span>{" "}
            {preview.notice}
          </p>
        </div>
        <Link
          href="/"
          className="shrink-0 text-sm font-medium text-text-secondary transition-colors hover:text-text-primary"
        >
          Back to splic.co
        </Link>
      </div>
    </div>
  );
}
