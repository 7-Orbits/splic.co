import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SectionHeading } from "@/components/ui/section-heading";
import { ScreenshotFrame } from "@/components/ui/screenshot-frame";
import { CtaSection } from "@/components/ui/cta-section";
import { ctaLabel, downloadHref } from "@/lib/site-config";
import {
  exampleInstruction,
  howItWorksExpectation,
  workflowSteps,
} from "@/content/workflow";

export const metadata: Metadata = {
  title: "How Splic works — from install to export",
  description:
    "See how to install Splic, describe an edit, review the agent's changes and export your video.",
};

export default function HowItWorksPage() {
  const steps = workflowSteps.filter((step) => step.onHowItWorks);

  return (
    <main id="main" className="flex-1">
      <section
        aria-labelledby="how-heading"
        className="pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16"
      >
        <div className="container-page">
          <SectionHeading
            id="how-heading"
            asPageHeading
            title="From download to finished video."
            description="Here's what working in Splic looks like, step by step."
          />
        </div>
      </section>

      <section
        id="install"
        aria-labelledby="install-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-left" opacity={0.65} />
        <div className="container-page">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div data-reveal="" className="lg:col-span-5">
              <p className="font-mono text-md text-text-tertiary">Before you start</p>
              <h2
                id="install-heading"
                className="headline mt-3 text-section text-text-primary"
                style={{ letterSpacing: "-0.025em" }}
              >
                Download and install
              </h2>
              <p className="lede mt-5">
                Download the installer for your operating system and follow the
                steps on the Download page. Splic isn&apos;t publicly
                downloadable yet — join early access to be notified at launch.
              </p>
              <p className="mt-6">
                <Link
                  href="/download"
                  className="text-md font-medium text-accent-primary transition-colors hover:text-accent-hover"
                >
                  Go to Download →
                </Link>
              </p>
            </div>
            <div className="lg:col-span-7">
              <ScreenshotFrame aspect="16 / 10" label="Illustrative" />
            </div>
          </div>
        </div>
      </section>

      {steps.map((step, index) => {
        const imageFirst = index % 2 === 1;
        return (
          <section
            key={step.id}
            id={step.id}
            aria-labelledby={`${step.id}-heading`}
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
                  <p className="font-mono text-md text-text-tertiary">
                    {step.number}
                  </p>
                  <h2
                    id={`${step.id}-heading`}
                    className="headline mt-3 text-section text-text-primary"
                    style={{ letterSpacing: "-0.025em" }}
                  >
                    {step.title}
                  </h2>
                  <p className="lede mt-5">{step.body}</p>
                  {step.id === "describe" ? (
                    <blockquote className="glass mt-6 rounded-lg px-4 py-3 text-md text-text-primary">
                      “{exampleInstruction}”
                    </blockquote>
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
        id="expect"
        aria-labelledby="expect-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-left" opacity={0.5} />
        <div className="container-page">
          <div data-reveal="" className="max-w-[640px]">
            <h2
              id="expect-heading"
              className="headline text-section text-text-primary"
              style={{ letterSpacing: "-0.025em" }}
            >
              {howItWorksExpectation.title}
            </h2>
            <ul className="mt-6 flex flex-col gap-3">
              {howItWorksExpectation.points.map((point) => (
                <li key={point} className="flex gap-3 text-md text-text-secondary">
                  <span aria-hidden="true" className="mt-2 h-px w-4 shrink-0 bg-border-strong" />
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-md text-text-secondary">
              Splic may not be able to complete every edit automatically.
            </p>
          </div>
        </div>
      </section>

      <CtaSection
        heading="Bring a clip and a sentence."
        supporting="Splic isn't publicly downloadable yet. Join early access and we'll tell you when it is."
        primary={{ label: ctaLabel, href: downloadHref }}
        secondary={{ label: "Explore features", href: "/features" }}
      />
    </main>
  );
}
