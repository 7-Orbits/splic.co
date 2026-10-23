import type { ReactNode } from "react";
import { StatusBadge } from "@/components/ui/status-badge";

interface PageHeaderProps {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
  sample?: boolean;
}

export function PageHeader({
  title,
  description,
  actions,
  sample = false,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-[-0.02em] text-text-primary">
            {title}
          </h1>
          {sample ? <StatusBadge tone="neutral">Sample data</StatusBadge> : null}
        </div>
        {description ? (
          <p className="mt-2 max-w-[640px] text-md leading-6 text-text-secondary">
            {description}
          </p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
