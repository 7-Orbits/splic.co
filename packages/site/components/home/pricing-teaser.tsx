import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import {
  anyPricingConfirmed,
  editingPlans,
  lowestConfirmedPaidPrice,
  premiumPlus,
} from "@/content/pricing";

export function PricingTeaser() {
  const planNames = [...editingPlans.map((plan) => plan.name), premiumPlus.name];

  return (
    <section
      id="pricing-teaser"
      aria-labelledby="pricing-teaser-heading"
      className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
    >
      <AmbientGlow variant="side-right" opacity={0.5} />
      <div className="container-page">
        <div data-reveal="" className="max-w-[640px]">
          <h2
            id="pricing-teaser-heading"
            className="headline text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Start free. Add what you need.
          </h2>
          <p className="lede mt-5">
            The full manual editor is free. Paid editing plans add agent usage
            and plugin access. Cloud storage is a separate option.
          </p>
        </div>

        <div data-reveal="" className="glass mt-10 overflow-hidden rounded-lg">
          <div className="flex flex-col gap-2 border-b border-border-subtle bg-white/[0.03] px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-md uppercase tracking-[0.08em] text-text-tertiary">
                Editing plans
              </p>
              <p className="mt-1.5 text-md font-medium text-text-primary">
                {planNames.join(" · ")}
              </p>
            </div>
            {anyPricingConfirmed && lowestConfirmedPaidPrice !== null ? (
              <p className="text-md text-text-secondary">
                From ${lowestConfirmedPaidPrice}/month
              </p>
            ) : (
              <p className="text-md text-text-tertiary">
                Pricing announced at launch
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 px-6 py-5 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-md uppercase tracking-[0.08em] text-text-tertiary">
                Optional cloud storage
              </p>
              <p className="mt-1.5 text-md font-medium text-text-primary">
                Add storage whenever you need it.
              </p>
            </div>
          </div>
        </div>

        <div data-reveal="" className="mt-8">
          <Button href="/pricing" variant="secondary" size="lg">
            Compare plans
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
