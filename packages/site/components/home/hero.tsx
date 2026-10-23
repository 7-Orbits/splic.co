import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { AgentDemo } from "./agent-demo";
import { downloadHref } from "@/lib/site-config";
import { platformMetadataLine } from "@/content/release";

export function Hero() {
  return (
    <section
      id="hero"
      data-hero=""
      aria-labelledby="hero-heading"
      className="relative isolate overflow-clip pt-24 pb-8 sm:pt-35 md:pb-12 lg:pb-16"
    >
      <div
        data-glow-parallax=""
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div data-glow-hero="" className="absolute inset-0">
          <AmbientGlow variant="top-center" opacity={0.75} />
        </div>
        <div data-glow-hero="" data-glow-drift="" className="absolute inset-0">
          <AmbientGlow variant="bottom-corners" />
        </div>
      </div>
      <div className="container-hero relative">
        {/* Left-aligned hero copy on the same content boundary as the
            navbar and the product preview below (Linear reference). */}
        <div className="max-w-[800px]">
          <h5
            id="hero-heading"
            className="headline text-hero text-text-primary"
            style={{ letterSpacing: "-0.035em" }}
          >
            <span className="block" data-hero-line="">
              You bring the vision.
            </span>
            <span className="block" data-hero-line="">
              Splic does the editing.
            </span>
          </h5>
          <p
            data-hero-fade=""
            className="mt-6 max-w-[520px] text-[15px] leading-[1.6] text-text-secondary sm:text-[16px]"
          >
            Describe the video you want. Splic works inside editing
            workspace, checks the result, and refines it while you stay in
            control.
          </p>
          <div
            data-hero-fade=""
            className="mt-8 flex w-full flex-col items-stretch gap-3 sm:w-auto sm:flex-row sm:items-center"
          >
            <Button href={downloadHref} size="md" className="w-full sm:w-auto">
              Download Splic
            </Button>
            <Button
              href="/how-it-works"
              variant="secondary"
              size="md"
              className="btn-hero-secondary w-full sm:w-auto"
            >
              See how it works
              <span aria-hidden="true">→</span>
            </Button>
          </div>
          <p data-hero-fade="" className="mt-4 text-sm text-text-tertiary">
            {platformMetadataLine}
          </p>
        </div>

        {/* Product preview — full content width, same left boundary. */}
        <div data-hero-preview="" className="mt-18 w-full">
          <AgentDemo />
        </div>
      </div>
    </section>
  );
}
