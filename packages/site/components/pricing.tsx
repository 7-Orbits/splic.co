import { Reveal } from "./reveal";
import { Section } from "./section";
import { SectionHeading } from "./section-heading";

const plans = [
  {
    title: "Splic",
    description: "The desktop editing experience and its included features.",
    supporting: "Plan pricing and usage limits to be announced.",
    emphasis: true,
    badge: null,
  },
  {
    title: "Cloud Storage",
    description: "Store projects, footage and exports in the cloud.",
    supporting: "Storage tiers to be announced.",
    emphasis: false,
    badge: null,
  },
  {
    title: "Splic + Cloud Storage",
    description:
      "One combined plan with a planned discount compared with purchasing separately.",
    supporting: "Combined plan details to be announced.",
    emphasis: false,
    badge: "Planned bundle",
  },
];

export function Pricing() {
  return (
    <Section id="pricing" labelledBy="pricing-title">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="pricing-title"
            eyebrow="PRICING"
            title="Choose how you create."
            description="Start with the editing experience you need. Add cloud storage when you need it."
          />
        </Reveal>

        <ul className="mt-14 grid gap-5 md:grid-cols-3">
          {plans.map((plan, index) => (
            <li
              key={plan.title}
              className={`flex flex-col border p-8 ${
                plan.emphasis
                  ? "border-line-strong bg-surface-strong"
                  : "border-line bg-surface-strong/40"
              }`}
            >
              <Reveal delay={index * 70} className="flex h-full flex-col">
                <div className="flex min-h-6 items-center gap-3">
                  {plan.badge ? (
                    <span className="inline-flex items-center rounded-xs border border-line-strong bg-surface-base px-3 py-1 text-xs uppercase tracking-[0.16em] text-text-secondary">
                      {plan.badge}
                    </span>
                  ) : null}
                </div>

                <h3 className="mt-3 text-2xl tracking-[-0.01em] text-text-primary">
                  {plan.title}
                </h3>
                <p className="mt-2 text-lg text-text-secondary">
                  {plan.description}
                </p>

                <div className="mt-8 border-t border-line pt-6">
                  <p className="text-md text-text-tertiary">
                    {plan.supporting}
                  </p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>

        <Reveal delay={120}>
          <p className="mt-8 text-md text-text-tertiary">
            Plans are being finalized. Nothing is available for purchase yet —
            pricing, quotas and billing are not operational.
          </p>
        </Reveal>
      </div>
    </Section>
  );
}
