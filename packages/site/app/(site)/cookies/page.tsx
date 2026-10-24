import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How Splic uses cookies and local storage for authentication, workspace preferences, and application performance.",
};

export default function CookiePolicyPage() {
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
              Cookie Policy
            </h1>
            <p className="lede mt-5 text-lg text-text-secondary">
              We believe in transparent, minimal data practices. Splic uses
              cookies and local storage strictly to keep you authenticated,
              remember your workspace preferences, and ensure reliable performance.
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
                Splic does not use third-party cross-site behavioral advertising
                cookies. Any future opt-in analytics or consent-management tools
                remain subject to owner confirmation before commercial launch.
              </p>
            </div>

            <article className="glass rounded-xl p-6 sm:p-8 flex flex-col gap-6">
              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  1. What Are Cookies?
                </h2>
                <p className="mt-2.5">
                  Cookies and web storage technologies (such as localStorage and
                  sessionStorage) are small data files saved to your browser or
                  device by websites you visit. They allow web platforms to
                  recognize your active session and persist your settings across
                  page reloads.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  2. How Splic Uses Storage Technologies
                </h2>
                <ul className="mt-2.5 list-disc pl-5 flex flex-col gap-2">
                  <li>
                    <strong className="text-text-primary">
                      Strictly Necessary (Essential):
                    </strong>{" "}
                    Required for basic site and console operations. These include
                    secure authentication tokens, CSRF protection, and session
                    identifiers in the{" "}
                    <Link
                      href="/console"
                      className="text-accent-primary hover:underline"
                    >
                      Splic Console
                    </Link>
                    .
                  </li>
                  <li>
                    <strong className="text-text-primary">
                      Preferences &amp; Functionality:
                    </strong>{" "}
                    Saves your chosen theme, sidebar navigation state, and
                    console table pagination preferences so you do not have to
                    reset them on every visit.
                  </li>
                  <li>
                    <strong className="text-text-primary">Performance:</strong>{" "}
                    Anonymized telemetry tokens used to measure page load
                    latencies and improve interface responsiveness.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  3. What We Do Not Do
                </h2>
                <p className="mt-2.5">
                  Splic does not sell personal browsing history, participate in
                  third-party ad-tracking networks, or place cross-site
                  behavioral tracking pixels on our marketing site.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  4. Managing Your Preferences
                </h2>
                <p className="mt-2.5">
                  Most modern browsers allow you to view, block, or delete
                  cookies through their settings panel. Note that disabling
                  essential session cookies may prevent you from logging into the
                  Splic Console.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  5. Questions
                </h2>
                <p className="mt-2.5">
                  If you have questions about our cookie or local storage
                  practices, please reach out to{" "}
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
