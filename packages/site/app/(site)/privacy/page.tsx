import type { Metadata } from "next";
import Link from "next/link";
import { AmbientGlow } from "@/components/ui/ambient-glow";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "How Splic protects your privacy. Local-first media handling, minimal telemetry, and transparent data practices.",
};

export default function PrivacyPolicyPage() {
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
              Privacy Policy
            </h1>
            <p className="lede mt-5 text-lg text-text-secondary">
              Splic is designed with a local-first philosophy. Your video clips,
              audio stems, and project files remain on your device by default.
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
                Splic is currently in private preview and development. Specific
                data retention windows, registered merchant entities, and formal
                sub-processor agreements are subject to owner confirmation prior
                to commercial general availability.
              </p>
            </div>

            <article className="glass rounded-xl p-6 sm:p-8 flex flex-col gap-6">
              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  1. Local-First Media Architecture
                </h2>
                <p className="mt-2.5">
                  Unlike cloud-only video editors, Splic operates directly on
                  your local filesystem. Your raw camera clips, project timelines,
                  and exported renders are stored on your local drive and are
                  never transmitted to our servers unless you explicitly opt in to
                  cloud rendering plugins or cloud backup storage.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  2. Information We Collect
                </h2>
                <ul className="mt-2.5 list-disc pl-5 flex flex-col gap-2">
                  <li>
                    <strong className="text-text-primary">Account Data:</strong>{" "}
                    Email address, user handle, and authentication credentials
                    when registering for early access or using the Splic Console.
                  </li>
                  <li>
                    <strong className="text-text-primary">Billing & Entitlements:</strong>{" "}
                    Subscription tiers, plugin license keys, and compute token
                    balances. Payment card details are handled directly by our
                    payment processor and never touch our application servers.
                  </li>
                  <li>
                    <strong className="text-text-primary">Agent Prompt Inputs:</strong>{" "}
                    Natural language instructions you provide to the editing agent
                    (e.g., &ldquo;Cut 4 seconds of silence&rdquo;) are processed to
                    generate timeline commands. We do not use your proprietary
                    footage to train generalized AI foundation models.
                  </li>
                  <li>
                    <strong className="text-text-primary">Telemetry & Diagnostics:</strong>{" "}
                    Anonymized crash reports, hardware profile information (OS,
                    CPU, GPU architecture), and performance metrics to help
                    improve rendering stability. Diagnostic telemetry can be
                    disabled in desktop application settings.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  3. Cloud Storage & Plugin Data
                </h2>
                <p className="mt-2.5">
                  If you purchase optional cloud storage or use third-party
                  plugins from the marketplace, data transfer is governed by the
                  following terms:
                </p>
                <ul className="mt-2 list-disc pl-5 flex flex-col gap-1.5">
                  <li>
                    Cloud storage files are encrypted in transit (TLS 1.3) and at
                    rest (AES-256).
                  </li>
                  <li>
                    Third-party plugins clearly declare whether they run locally
                    via WebAssembly/native binaries or communicate with remote
                    APIs.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  4. Data Retention & Deletion
                </h2>
                <p className="mt-2.5">
                  You may request account deletion or export your account metadata
                  at any time via the{" "}
                  <Link
                    href="/console"
                    className="text-accent-primary hover:underline"
                  >
                    Splic Console
                  </Link>{" "}
                  or by emailing{" "}
                  <a
                    href="mailto:contact@splic.co"
                    className="text-accent-primary hover:underline"
                  >
                    contact@splic.co
                  </a>
                  . Upon verified request, account identifiers are purged within
                  30 days.
                </p>
              </section>

              <section>
                <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                  5. Contact & Privacy Inquiries
                </h2>
                <p className="mt-2.5">
                  For privacy questions, data requests, or compliance inquiries,
                  reach our team at{" "}
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
