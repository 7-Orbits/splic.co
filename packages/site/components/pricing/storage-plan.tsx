import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { earlyAccessHref } from "@/content/navigation";
import type { StorageTier } from "@/content/pricing";

export function StoragePlan({ tier }: { tier: StorageTier }) {
  return (
    <div data-spotlight="" className="glass flex flex-col rounded-lg p-6">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-md font-semibold text-text-primary">
          {tier.planName}
        </h3>
        <StatusBadge>Add-on</StatusBadge>
      </div>
      <p className="mt-4 text-text-primary">
        {tier.confirmed && tier.priceMonthly !== null ? (
          <span className="flex items-baseline gap-1">
            <span className="text-md text-text-secondary">$</span>
            <span className="text-2xl font-semibold tabular-nums">
              {tier.priceMonthly}
            </span>
            <span className="text-md text-text-secondary">/month</span>
          </span>
        ) : (
          <span className="text-md font-medium text-text-secondary">
            Announced at launch
          </span>
        )}
      </p>
      <p className="mt-3 text-md text-text-tertiary">
        Storage amount: {tier.quota ?? "announced at launch"}
      </p>
      <div className="mt-6">
        <Button href={earlyAccessHref} variant="secondary" className="w-full">
          Get early access
        </Button>
      </div>
    </div>
  );
}
