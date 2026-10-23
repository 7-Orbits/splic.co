import { ArrowUpRight, CalendarDays, CreditCard, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import { formatDate } from "@/lib/console/format";
import type { ConsolePlan, PlanStatus } from "@/lib/console/types";
import { Panel } from "./panel";

const statusTone: Record<PlanStatus, { label: string; tone: BadgeTone }> = {
  active: { label: "Active", tone: "ok" },
  trialing: { label: "Trialing", tone: "info" },
  past_due: { label: "Payment due", tone: "warn" },
  canceled: { label: "Canceled", tone: "neutral" },
  none: { label: "Free", tone: "neutral" },
};

interface PlanSummaryProps {
  plan: ConsolePlan;
  sample?: boolean;
}

export function PlanSummary({ plan, sample = false }: PlanSummaryProps) {
  const status = statusTone[plan.status];

  return (
    <Panel tone="raised" className="h-full overflow-hidden">
      <div className="flex flex-col gap-5 p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
              Current plan
            </p>
            <StatusBadge tone={status.tone}>{status.label}</StatusBadge>
            {sample ? (
              <span className="text-xs font-medium text-text-tertiary">
                Sample
              </span>
            ) : null}
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
            {plan.name}
          </h2>
          <p className="mt-1.5 max-w-[460px] text-md text-text-secondary">
            {plan.audience}
          </p>
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3">
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
                <CreditCard aria-hidden="true" className="h-3.5 w-3.5" />
                Billing
              </dt>
              <dd className="mt-1 text-md text-text-primary">
                {plan.confirmed && plan.priceMonthly !== null
                  ? `$${plan.priceMonthly} / month`
                  : "Price announced at launch"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
                <CalendarDays aria-hidden="true" className="h-3.5 w-3.5" />
                Renewal
              </dt>
              <dd className="mt-1 text-md text-text-primary">
                {plan.renewalDate ? formatDate(plan.renewalDate) : "Not renewing"}
              </dd>
            </div>
            <div>
              <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.06em] text-text-tertiary">
                <Sparkles aria-hidden="true" className="h-3.5 w-3.5" />
                Included
              </dt>
              <dd className="mt-1 text-md text-text-primary">
                Agent usage and plugin access
              </dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <Button href="/pricing" variant="secondary" size="sm">
            Manage plan
            <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </Panel>
  );
}
