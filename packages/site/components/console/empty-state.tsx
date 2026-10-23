import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  icon?: LucideIcon;
  compact?: boolean;
}

export function EmptyState({
  title,
  description,
  action,
  icon: Icon = Inbox,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border border-dashed border-border-default text-center ${
        compact ? "px-5 py-8" : "px-6 py-12"
      }`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-md border border-border-subtle bg-surface-raised text-text-secondary">
        <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
      </span>
      <p className="mt-4 text-md font-medium text-text-primary">{title}</p>
      {description ? (
        <p className="mt-1.5 max-w-[420px] text-sm leading-5 text-text-secondary">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}
