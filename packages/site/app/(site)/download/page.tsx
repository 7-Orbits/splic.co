import type { Metadata } from "next";
import Link from "next/link";
import { PlatformSelector } from "@/components/download/platform-selector";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { StateBlock } from "@/components/ui/state-block";
import { availablePlatforms, isEarlyAccess, platforms } from "@/content/release";
import { ctaLabel, downloadHref, waitlistHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: isEarlyAccess
    ? "Download Splic — early access"
    : "Download Splic for macOS, Windows and Linux",
  description: isEarlyAccess
    ? "Splic isn't publicly downloadable yet. Join early access for Splic."
    : "Choose your operating system and download the Splic installer.",
};

export default function DownloadPage() {
  const showInstallers = !isEarlyAccess && availablePlatforms.length > 0;

  return (
    <main id="main" className="flex-1">
      <section
        aria-labelledby="download-heading"
        className="pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16"
      >
        <div className="container-page">
          <SectionHeading
            id="download-heading"
            asPageHeading
            title="Download Splic."
            description={
              showInstallers
                ? "Choose your operating system. The installer includes everything you need for local editing."
                : "Choose your operating system. Splic is in development there is nothing to download just yet."
            }
          />
        </div>
      </section>

      <section
        aria-labelledby="download-panel-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-right" opacity={0.6} />
        <div className="container-page">
          <h2 id="download-panel-heading" className="sr-only">
            Installers
          </h2>

          {showInstallers ? (
            <PlatformSelector platforms={platforms} />
          ) : (
            <div className="flex flex-col gap-6">
              <StateBlock
                kind="unavailable"
                title="Splic isn't available to download yet."
                description="The desktop app is in development. Join early access and we'll email you when installers for macOS, Windows and Linux are ready."
                {...(waitlistHref
                  ? { action: { label: "Join early access", href: waitlistHref } }
                  : {})}
              />
              {!waitlistHref ? (
                <p className="text-md text-text-secondary">
                  Early-access signup isn&apos;t configured yet. Check back
                  soon or open this page on your computer later to download.
                </p>
              ) : null}
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button href={downloadHref} variant="secondary" size="lg">
                  {ctaLabel}
                </Button>
                <Button href="/how-it-works" variant="ghost" size="lg">
                  See how it works
                  <span aria-hidden="true">→</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section
        aria-labelledby="download-next-heading"
        className="py-8 md:py-12 lg:py-16"
      >
        <div className="container-page">
          <div data-reveal="" className="max-w-[640px]">
            <h2
              id="download-next-heading"
              className="headline text-section text-text-primary"
              style={{ letterSpacing: "-0.025em" }}
            >
              What happens after you install
            </h2>
            <p className="lede mt-5">
              Once Splic is installed, you&apos;ll create or open a project,
              describe an edit in plain language, review the agent&apos;s
              changes and export your video.
            </p>
            <p className="mt-6">
              <Link
                href="/how-it-works"
                className="text-md font-medium text-accent-primary transition-colors hover:text-accent-hover"
              >
                See how Splic works →
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
