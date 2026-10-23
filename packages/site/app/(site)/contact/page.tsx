import type { Metadata } from "next";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { siteConfig, contactHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "How to reach the Splic team. Contact details are announced at launch.",
};

export default function ContactPage() {
  return (
    <main id="main" className="flex-1">
      <section className="relative isolate overflow-clip pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16">
        <AmbientGlow variant="side-right" opacity={0.5} />
        <div className="container-page">
          <div data-reveal="" className="max-w-[640px]">
            <p className="eyebrow">Contact</p>
            <h1
              className="headline mt-4 text-page text-text-primary"
              style={{ letterSpacing: "-0.03em" }}
            >
              Get in touch.
            </h1>
            <p className="lede mt-5">
              Splic is in development. Contact details are announced at
              launch — until then, the project follows along in public on
              GitHub.
            </p>
          </div>

          <div
            data-reveal-group=""
            className="mt-12 flex max-w-[720px] flex-col gap-4"
          >
            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
                Contact details announced at launch
              </h2>
              <p className="mt-2 text-md text-text-secondary">
                A dedicated contact address is not live yet. For project
                updates, issues or pull requests, use the GitHub repository.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button href={siteConfig.links.repository} variant="secondary">
                  Open GitHub repo
                  <span aria-hidden="true">↗</span>
                </Button>
                {contactHref ? (
                  <Button href={contactHref}>Email us</Button>
                ) : null}
              </div>
            </div>

            <div className="glass rounded-lg p-6">
              <h2 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
                Sales enquiries
              </h2>
              <p className="mt-2 text-md text-text-secondary">
                Pricing is not final. Plans, entitlements and storage options
                are published on the pricing page and marked as announced at
                launch until they are confirmed.
              </p>
              <div className="mt-5">
                <Button href="/pricing" variant="secondary">
                  See pricing
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
