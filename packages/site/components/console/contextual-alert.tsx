import type { ReactNode } from "react";
import {
  CircleAlert,
  CircleCheck,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import type { AlertTone } from "@/lib/console/types";

const toneStyles: Record<
  AlertTone,
  { wrap: string; icon: string; Icon: LucideIcon }
> = {
  info: {
    wrap: "border-accent-secondary/30 bg-accent-secondary/[0.06]",
    icon: "text-accent-secondary",
    Icon: Info,
  },
  success: {
    wrap: "border-accent-success/30 bg-accent-success/[0.06]",
    icon: "text-accent-success",
    Icon: CircleCheck,
  },
  warning: {
    wrap: "border-accent-warning/30 bg-accent-warning/[0.06]",
    icon: "text-accent-warning",
    Icon: TriangleAlert,
  },
  error: {
    wrap: "border-accent-error/30 bg-accent-error/[0.06]",
    icon: "text-accent-error",
    Icon: CircleAlert,
  },
};

interface ContextualAlertProps {
  tone: AlertTone;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  sample?: boolean;
}

export function ContextualAlert({
  tone,
  title,
  description,
  action,
  sample = false,
}: ContextualAlertProps) {
  const { wrap, icon, Icon } = toneStyles[tone];

  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={`flex gap-3 rounded-md border px-4 py-3 ${wrap}`}
    >
      <Icon
        aria-hidden="true"
        className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`}
        strokeWidth={1.8}
      />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-md font-medium text-text-primary">{title}</p>
          {sample ? (
            <span className="rounded-full border border-border-default px-2 py-0.5 text-xs font-medium text-text-tertiary">
              Sample
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm leading-5 text-text-secondary">
            {description}
          </p>
        ) : null}
        {action ? <div className="mt-3">{action}</div> : null}
      </div>
    </div>
  );
}
