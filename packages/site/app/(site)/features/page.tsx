import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScreenshotFrame } from "@/components/ui/screenshot-frame";
import { StatusBadge } from "@/components/ui/status-badge";
import { CtaSection } from "@/components/ui/cta-section";
import { ctaLabel, downloadHref } from "@/lib/site-config";
import { featureLimits, features } from "@/content/features";

export const metadata: Metadata = {
  title: "Features",
  description:
    "What Splic can do: natural-language editing, agent-driven actions, a full timeline, plugins and optional cloud storage.",
};

export default function FeaturesPage() {
  return (
    <main id="main" className="flex-1">
      <section
        aria-labelledby="features-heading"
        className="pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16"
      >
        <div className="container-page">
          <SectionHeading
            id="features-heading"
            asPageHeading
            title={
              <>
                Everything Splic does,
                <br />
                and where it stops.
              </>
            }
            description="A real editor, an agent that works inside it, and plugins for specific workflows."
          />
        </div>
      </section>

      {features.map((feature, index) => {
        const imageFirst = index % 2 === 1;
        return (
          <section
            key={feature.id}
            id={feature.id}
            aria-labelledby={`${feature.id}-heading`}
            className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
          >
            <AmbientGlow
              variant={imageFirst ? "side-left" : "side-right"}
              opacity={0.65}
            />
            <div className="container-page">
              <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
                <div
                  data-reveal=""
                  className={`lg:col-span-5 ${imageFirst ? "lg:order-2 lg:col-start-8" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <StatusBadge tone="warn">Planned</StatusBadge>
                    <span className="text-md text-text-tertiary">
                      {feature.status === "planned"
                        ? "Not yet shipped"
                        : "Available"}
                    </span>
                  </div>
                  <h2
                    id={`${feature.id}-heading`}
                    className="headline mt-4 text-section text-text-primary"
                    style={{ letterSpacing: "-0.025em" }}
                  >
                    {feature.subtitle}
                  </h2>
                  <p className="mt-4 text-md font-medium text-text-primary">
                    {feature.title}
                  </p>
                  <p className="lede mt-4">{feature.detail}</p>
                  <p className="mt-4 text-md text-text-secondary">
                    {feature.benefit}
                  </p>
                  {feature.id === "natural-language-editing" ? (
                    <p className="mt-6">
                      <Link
                        href="/how-it-works"
                        className="text-md font-medium text-accent-primary transition-colors hover:text-accent-hover"
                      >
                        See how Splic works →
                      </Link>
                    </p>
                  ) : null}
                  {feature.id === "plugin-capabilities" ? (
                    <p className="mt-6">
                      <Link
                        href="/plugins"
                        className="text-md font-medium text-accent-primary transition-colors hover:text-accent-hover"
                      >
                        Explore plugins →
                      </Link>
                    </p>
                  ) : null}
                  {feature.id === "optional-cloud-storage" ? (
                    <p className="mt-6">
                      <Link
                        href="/pricing"
                        className="text-md font-medium text-accent-primary transition-colors hover:text-accent-hover"
                      >
                        Explore plans →
                      </Link>
                    </p>
                  ) : null}
                </div>
                <div
                  className={`lg:col-span-7 ${imageFirst ? "lg:order-1 lg:col-start-1 lg:row-start-1" : ""}`}
                >
                  <ScreenshotFrame aspect="16 / 10" label="Illustrative" />
                </div>
              </div>
            </div>
          </section>
        );
      })}

      <section
        id="limits"
        aria-labelledby="limits-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-left" opacity={0.5} />
        <div className="container-page">
          <div data-reveal="" className="max-w-[640px]">
            <h2
              id="limits-heading"
              className="headline text-section text-text-primary"
              style={{ letterSpacing: "-0.025em" }}
            >
              {featureLimits.title}
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {featureLimits.points.map((point) => (
                <li key={point} className="flex gap-3 text-md text-text-secondary">
                  <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-border-strong" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaSection
        heading="Ready to try Splic?"
        supporting="Splic isn't publicly downloadable yet. Join early access and we'll tell you when it is."
        primary={{ label: ctaLabel, href: downloadHref }}
        secondary={{ label: "How it works", href: "/how-it-works" }}
      />
    </main>
  );
}
