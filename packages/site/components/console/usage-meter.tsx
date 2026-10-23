import { formatPercent, percentOf } from "@/lib/console/format";

interface UsageMeterProps {
  label: string;
  value: number;
  max: number;
  valueLabel: string;
  caption?: string;
  tone?: "primary" | "secondary";
  className?: string;
}

export function UsageMeter({
  label,
  value,
  max,
  valueLabel,
  caption,
  tone = "primary",
  className = "",
}: UsageMeterProps) {
  const percent = percentOf(value, max);

  return (
    <div className={className}>
      <div className="flex items-baseline justify-between gap-4">
        <p className="text-md font-medium text-text-primary">{label}</p>
        <p className="text-sm tabular-nums text-text-secondary">
          {formatPercent(value, max)}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} used`}
        aria-valuemin={0}
        aria-valuemax={Math.round(max)}
        aria-valuenow={Math.round(value)}
        aria-valuetext={`${valueLabel} used, ${formatPercent(value, max)} of the allowance`}
        className="mt-3 h-1.5 overflow-hidden rounded-full bg-surface-interactive"
      >
        <div
          className={`h-full rounded-full ${
            tone === "secondary" ? "bg-accent-secondary" : "bg-accent-primary"
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-text-secondary">{valueLabel}</p>
        {caption ? <p className="text-sm text-text-tertiary">{caption}</p> : null}
      </div>
    </div>
  );
}
