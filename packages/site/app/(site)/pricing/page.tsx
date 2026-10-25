import type { Metadata } from "next";
import { ComparisonTable } from "@/components/pricing/comparison-table";
import { PlanCard } from "@/components/pricing/plan-card";
import { StoragePlan } from "@/components/pricing/storage-plan";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { CtaSection } from "@/components/ui/cta-section";
import { FaqAccordion } from "@/components/ui/faq-accordion";
import { SectionHeading } from "@/components/ui/section-heading";
import { faqs } from "@/content/faq";
import {
  anyPricingConfirmed,
  editingPlans,
  premiumPlus,
  pricingNotice,
  storageTiers,
} from "@/content/pricing";
import { contactHref, ctaHref, ctaLabel } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Start with the free manual editor. Compare editing plans and optional cloud storage.",
};

export default function PricingPage() {
  const pricingFaq = faqs
    .filter((faq) => faq.onPricing)
    .map(({ id, question, answer }) => ({ id, question, answer }));

  return (
    <main id="main" className="flex-1">
      <section
        aria-labelledby="pricing-heading"
        className="pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16"
      >
        <div className="container-page">
          <SectionHeading
            id="pricing-heading"
            asPageHeading
            title="Choose how you create."
            description="Start free with the full manual editor. Add agent usage and plugins with an editing plan. Add cloud storage separately if you need more room."
          />
          {!anyPricingConfirmed ? (
            <p className="mt-6 inline-flex rounded-full border border-accent-warning/40 px-3 py-1 text-md font-medium text-accent-warning">
              {pricingNotice}
            </p>
          ) : null}
        </div>
      </section>

      <section
        id="editing-plans"
        aria-labelledby="editing-plans-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-left" opacity={0.5} />
        <div className="container-page">
          <h2
            id="editing-plans-heading"
            data-reveal=""
            className="headline text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Editing plans
          </h2>
          <p data-reveal="" className="lede mt-5 max-w-[640px]">
            Every plan includes the full manual editor. Paid plans add agent
            usage and plugin access.
          </p>

          <div className="relative isolate mt-10">
            <AmbientGlow variant="center" opacity={0.7} />
            <div
              data-reveal-group=""
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
            >
              {editingPlans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))}
            </div>
          </div>

          <div
            data-reveal=""
            className="glass mt-4 flex flex-col gap-4 rounded-lg px-6 py-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <h3 className="text-md font-semibold text-text-primary">
                {premiumPlus.name}
              </h3>
              <p className="mt-1 text-md text-text-secondary">
                {premiumPlus.description}
              </p>
            </div>
            {contactHref ? (
              <Button href={contactHref} variant="secondary">
                Contact sales
              </Button>
            ) : (
              <p className="text-md text-text-tertiary">
                Contact details announced at launch.
              </p>
            )}
          </div>

          <div data-reveal="" className="mt-10">
            <ComparisonTable plans={editingPlans} />
          </div>
        </div>
      </section>

      <section
        id="cloud-storage"
        aria-labelledby="cloud-storage-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-right" opacity={0.5} />
        <div className="container-page">
          <h2
            id="cloud-storage-heading"
            data-reveal=""
            className="headline text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Cloud storage
          </h2>
          <p data-reveal="" className="lede mt-5 max-w-[640px]">
            Optional. Add more room for projects, footage and exports.
          </p>
          <div
            data-reveal-group=""
            className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {storageTiers.map((tier) => (
              <StoragePlan key={tier.id} tier={tier} />
            ))}
          </div>
          <p data-reveal="" className="mt-6 text-md text-text-tertiary">
            Local editing never requires cloud storage.
          </p>
        </div>
      </section>

      <section
        id="pricing-faq"
        aria-labelledby="pricing-faq-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-left" opacity={0.45} />
        <div className="container-page">
          <h2
            id="pricing-faq-heading"
            data-reveal=""
            className="headline text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Pricing questions
          </h2>
          <div className="mt-8 max-w-[800px]">
            <FaqAccordion items={pricingFaq} idPrefix="pricing-faq" />
          </div>
        </div>
      </section>

      <CtaSection
        heading="Start with the free editor."
        supporting="Splic isn't publicly downloadable yet. Join early access and we'll tell you when it is."
        primary={{ label: ctaLabel, href: ctaHref }}
        secondary={{ label: "How it works", href: "/how-it-works" }}
      />
    </main>
  );
}
