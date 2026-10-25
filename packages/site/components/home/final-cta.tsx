import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { ctaHref } from "@/lib/site-config";
import { platformMetadataLine } from "@/content/release";

export function FinalCta() {
  return (
    <section
      id="download"
      aria-labelledby="final-cta-heading"
      className="relative isolate overflow-clip border-t border-border-subtle bg-surface-base py-20 sm:py-24 md:py-28 lg:py-32"
    >
      {/* Restrained atmospheric lighting blending into the page */}
      <div
        data-glow-parallax=""
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div data-glow-hero="" data-glow-drift="" className="absolute inset-0">
          <AmbientGlow variant="lower-center" opacity={0.65} />
        </div>
      </div>

      {/* Top subtle highlight */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent"
      />

      <div className="container-page relative">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Left Column: Headline, Narrative, and Actions */}
          <div className="lg:col-span-7">
            <p data-reveal="" className="eyebrow text-accent-primary">
              Early Access
            </p>
            <h2
              id="final-cta-heading"
              data-reveal=""
              className="headline mt-4 text-3xl sm:text-4xl md:text-5xl lg:text-[52px] leading-[1.12] text-text-primary tracking-[-0.03em]"
            >
              Work alongside an agent that edits with you.
            </h2>
            <p
              data-reveal=""
              className="mt-6 max-w-xl text-lg sm:text-xl text-text-secondary leading-relaxed"
            >
              Splic is in active development. We are rolling out private preview
              builds to creators, video editors, and tinkerers who want
              transparent local control paired with intelligent timeline
              automation.
            </p>

            <div
              data-reveal=""
              className="mt-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5"
            >
              <Button
                href={ctaHref}
                size="lg"
                className="w-full sm:w-auto"
              >
                Get early access
              </Button>
              <Button
                href="/pricing"
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto"
              >
                Explore pricing
                <span aria-hidden="true">→</span>
              </Button>
            </div>

            <p data-reveal="" className="mt-5 text-sm text-text-tertiary">
              {platformMetadataLine} · No forced cloud storage · Keep full creative ownership
            </p>
          </div>

          {/* Right Column: Architectural preview card */}
          <div className="lg:col-span-5 min-w-0">
            <div
              data-reveal=""
              className="glass-frame relative overflow-hidden rounded-xl border border-border-subtle bg-surface-raised/80 p-6 sm:p-7 shadow-product backdrop-blur-xl"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.08]"
              />

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border-subtle pb-4">
                <div>
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary block">
                    Milestone
                  </span>
                  <span className="text-sm font-medium text-text-primary mt-0.5 block">
                    Private Preview
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border-default bg-surface-interactive/60 px-3 py-1 font-mono text-xs text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-primary pulse-dot" />
                  Active Development
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-5">
                <div className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-elevated font-mono text-xs font-medium text-text-secondary">
                    01
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">
                      Local-first execution
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary leading-normal">
                      High-bitrate camera files stay on your local disk. Never
                      wait for full project uploads before cutting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-elevated font-mono text-xs font-medium text-text-secondary">
                    02
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">
                      Inspectable timeline diffs
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary leading-normal">
                      Every cut, trim, and ripple change is proposed with an
                      inspectable preview. You stay in command.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border border-border-default bg-surface-elevated font-mono text-xs font-medium text-text-secondary">
                    03
                  </span>
                  <div>
                    <h3 className="text-sm font-medium text-text-primary">
                      Extensible plugin ecosystem
                    </h3>
                    <p className="mt-1 text-xs text-text-secondary leading-normal">
                      Connect custom local scripts, audio cleanup models, or
                      cloud GPU workers without vendor lock-in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
