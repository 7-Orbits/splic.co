import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "Terms of Service governing the use of the Splic desktop editor, console services, plugin marketplace, and cloud features.",
};

export default function TermsOfServicePage() {
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
              Terms of Service
            </h1>
            <p className="lede mt-5 text-lg text-text-secondary">
              These terms govern your access to the Splic desktop application,
              early access builds, developer plugins, and the Splic Console.
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
                Splic is in preview development. Formal corporate incorporation,
                governing jurisdiction (country/state venue), binding dispute
                arbitration clauses, and production enterprise SLAs remain subject
                to owner confirmation prior to public commercial release.
              </p>
            </div>

            <article className="glass rounded-xl p-6 sm:p-8 flex flex-col gap-6">
              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  1. Acceptance of Terms
                </h2>
                <p className="mt-2.5">
                  By downloading, installing, or accessing Splic or the Splic
                  Console, you agree to be bound by these Terms of Service. If you
                  are accessing the software on behalf of an organization, you
                  represent that you have the authority to bind that entity.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  2. User Content & Creative Ownership
                </h2>
                <p className="mt-2.5">
                  <strong className="text-text-primary">
                    You retain 100% ownership of your media.
                  </strong>{" "}
                  All video clips, audio tracks, graphics, project timelines, and
                  rendered outputs processed within Splic remain your exclusive
                  intellectual property. Splic claims no copyright, license, or
                  ownership over your creative works.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  3. Software License & Development Preview
                </h2>
                <p className="mt-2.5">
                  During early access, Splic grants you a revocable, non-exclusive,
                  non-transferable license to use preview builds of the desktop
                  editor for evaluation, testing, and creative production.
                  Preview software is provided &ldquo;as is&rdquo; without
                  guarantees of uninterrupted or error-free operation.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  4. Subscriptions, Tokens & Marketplace Plugins
                </h2>
                <ul className="mt-2.5 list-disc pl-5 flex flex-col gap-2">
                  <li>
                    <strong className="text-text-primary">Subscriptions:</strong>{" "}
                    Paid plans provide access to higher agent token allowances,
                    priority cloud rendering, and extended storage. Billing terms
                    and pricing are outlined on the{" "}
                    <Link
                      href="/pricing"
                      className="text-accent-primary hover:underline"
                    >
                      Pricing page
                    </Link>
                    .
                  </li>
                  <li>
                    <strong className="text-text-primary">Token Top-ups:</strong>{" "}
                    AI agent compute tokens are allocated monthly based on your
                    tier. Additional token packs can be purchased as needed.
                  </li>
                  <li>
                    <strong className="text-text-primary">Plugins:</strong> The
                    Splic plugin directory includes first-party and third-party
                    extensions. Plugin developers set their own pricing and
                    licensing within platform guidelines.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  5. Acceptable Use
                </h2>
                <p className="mt-2.5">
                  You agree not to use Splic to generate defamatory, unlawful, or
                  harmful media, attempt to reverse-engineer closed components of
                  the backend agent runtime, or bypass license checks and account
                  quotas.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  6. Termination
                </h2>
                <p className="mt-2.5">
                  You may terminate your account at any time via the{" "}
                  <Link
                    href="/console"
                    className="text-accent-primary hover:underline"
                  >
                    Console
                  </Link>
                  . We reserve the right to suspend or terminate accounts that
                  violate these Terms or engage in fraudulent activity.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  7. Inquiries & Legal Notices
                </h2>
                <p className="mt-2.5">
                  For legal inquiries or notices regarding these Terms, contact{" "}
                  <a
                    href="mailto:contact@splic.co"
                    className="text-accent-primary hover:underline"
                  >
                    contact@splic.co
                  </a>
                  .
                </p>
              </section>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}
