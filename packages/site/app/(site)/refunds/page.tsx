import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description:
    "Refund and cancellation policies for Splic subscriptions, plugin purchases, compute token packs, and cloud storage.",
};

export default function RefundPolicyPage() {
  return (
    <main id="main" className="flex-1">
      <section className="relative isolate overflow-clip pt-20 pb-16 md:pb-24 lg:pt-28 lg:pb-32">
        <AmbientGlow variant="side-right" opacity={0.4} />
        <div className="container-page">
          <div data-reveal="" className="max-w-[760px]">
            <p className="eyebrow">Legal</p>
            <h1
              className="headline mt-4 text-3xl sm:text-4xl md:text-5xl text-text-primary tracking-[-0.03em]"
            >
              Refund &amp; Cancellation Policy
            </h1>
            <p className="lede mt-5 text-lg text-text-secondary">
              We want you to be confident using Splic. Here is how cancellations,
              subscription renewals, plugin licenses, and compute tokens are
              handled.
            </p>
            <p className="mt-3 text-xs text-text-tertiary">
              Last updated: October 24, 2026 · Development preview
            </p>
          </div>

          <div
            data-reveal-group=""
            className="mt-12 flex max-w-[820px] flex-col gap-6 text-sm text-text-secondary leading-relaxed"
          >
            {/* Notice banner */}
            <div className="rounded-lg border border-border-default bg-surface-raised/80 p-5 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.14em] text-accent-primary font-mono">
                Owner Confirmation Flag
              </p>
              <p className="mt-1.5 text-xs text-text-secondary">
                Splic is currently in private preview. Exact refund eligibility
                windows (e.g. 14-day statutory return period in EU/UK vs.
                custom policy), payment gateway chargeback rules, and developer
                payout clawbacks remain subject to owner confirmation before paid
                transactions open.
              </p>
            </div>

            <article className="glass rounded-xl p-6 sm:p-8 flex flex-col gap-6">
              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  1. Subscription Cancellations
                </h2>
                <p className="mt-2.5">
                  You can cancel your Splic subscription at any time directly
                  within the{" "}
                  <Link
                    href="/console"
                    className="text-accent-primary hover:underline"
                  >
                    Splic Console
                  </Link>{" "}
                  under Billing &amp; Plans. Once cancelled:
                </p>
                <ul className="mt-2 list-disc pl-5 flex flex-col gap-1.5">
                  <li>
                    Your plan benefits and token allocations remain active
                    through the end of the current paid billing period.
                  </li>
                  <li>
                    No further recurring charges will be made to your payment
                    method.
                  </li>
                  <li>
                    Your local projects, timelines, and clips remain completely
                    intact on your computer.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  2. Subscription Refunds
                </h2>
                <p className="mt-2.5">
                  If you purchase an annual or monthly subscription and realize
                  Splic is incompatible with your system or workflow, you may
                  request a full refund within 14 days of the initial purchase,
                  provided compute tokens have not been heavily consumed.
                  Subsequent recurring renewal periods are non-refundable unless
                  mandated by applicable consumer protection laws.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  3. AI Compute Tokens &amp; Cloud Storage
                </h2>
                <p className="mt-2.5">
                  Due to direct upstream computational costs incurred when
                  rendering edits with agent intelligence and reserving cloud
                  disk space:
                </p>
                <ul className="mt-2 list-disc pl-5 flex flex-col gap-1.5">
                  <li>
                    Tokens consumed for agent timeline reasoning, script
                    generation, and cloud rendering cannot be refunded once
                    executed.
                  </li>
                  <li>
                    Unused token top-up packages may be refunded within 14 days
                    of purchase if no tokens from the pack were spent.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  4. Marketplace Plugin Purchases
                </h2>
                <p className="mt-2.5">
                  Third-party plugins purchased via Splic are eligible for a
                  refund within 14 days if the plugin is provably defective, fails
                  to load on supported operating systems, or materially diverges
                  from its documented features. Once verified, refunds are
                  credited back to the original payment source.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  5. How to Request a Refund
                </h2>
                <p className="mt-2.5">
                  To initiate a cancellation or refund request, please email{" "}
                  <a
                    href="mailto:contact@splic.co"
                    className="text-accent-primary hover:underline"
                  >
                    contact@splic.co
                  </a>{" "}
                  with your account email, order reference ID, and a brief
                  description of the issue. Our support team reviews and
                  processes all requests within 3 business days.
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
