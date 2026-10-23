import { Button } from "@/components/ui/button";
import type { EditingPlan } from "@/content/pricing";

function formatPrice(plan: EditingPlan): string {
  if (!plan.confirmed || plan.priceMonthly === null) return "Announced at launch";
  return plan.priceMonthly === 0 ? "$0" : `$${plan.priceMonthly}`;
}

interface PlanCardProps {
  plan: EditingPlan;
}

export function PlanCard({ plan }: PlanCardProps) {
  const showCheckout = plan.confirmed && plan.cta === "choose";

  return (
    <div data-spotlight="" className="glass flex flex-col rounded-lg p-6">
      <h3 className="text-2xl font-semibold tracking-[-0.01em] text-text-primary">
        {plan.name}
      </h3>
      <p className="mt-2 text-md text-text-tertiary">{plan.audience}</p>
      <p className="mt-5 flex items-baseline gap-1 text-text-primary">
        {plan.confirmed && plan.priceMonthly !== null && plan.priceMonthly > 0 ? (
          <>
            <span className="text-md text-text-secondary">$</span>
            <span className="text-section font-semibold tabular-nums">
              {plan.priceMonthly}
            </span>
            <span className="text-md text-text-secondary">/month</span>
          </>
        ) : (
          <span className="text-md font-medium text-text-secondary">
            {formatPrice(plan)}
          </span>
        )}
      </p>
      <ul className="mt-6 flex flex-1 flex-col gap-3 border-t border-border-subtle pt-6">
        {plan.entitlements.map((entitlement) => (
          <li key={entitlement.label} className="text-md">
            <span className="block text-text-tertiary">{entitlement.label}</span>
            <span
              className={`mt-0.5 block ${
                entitlement.confirmed ? "text-text-primary" : "text-text-secondary"
              }`}
            >
              {entitlement.confirmed
                ? entitlement.value
                : "Announced at launch"}
            </span>
          </li>
        ))}
      </ul>
      <div className="mt-6">
        {plan.cta === "download" || !showCheckout ? (
          <Button href="/download" variant="secondary" className="w-full">
            {plan.cta === "download" ? "Download Splic" : "Get early access"}
          </Button>
        ) : (
          <Button className="w-full">Choose {plan.name}</Button>
        )}
      </div>
    </div>
  );
}
