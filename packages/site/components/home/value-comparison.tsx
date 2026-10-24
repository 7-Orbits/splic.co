import { AmbientGlow } from "@/components/ui/ambient-glow";

const byHand = [
  "Scrub the timeline for the right cut.",
  "Trim, speed-ramp and level audio clip by clip.",
  "Repeat the same fixes on every video.",
];

const withSplic = [
  "Describe the change in plain language.",
  "The agent performs supported editing actions.",
  "Review the result and refine it. You decide what stays.",
];

export function ValueComparison() {
  return (
    <section
      id="value"
      aria-labelledby="value-heading"
      className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
    >
      <AmbientGlow variant="side-right" opacity={0.45} />
      <div className="container-page">
        <div data-reveal="" className="max-w-[640px]">
          <p className="eyebrow">Why Splic</p>
          <h2
            id="value-heading"
            className="headline mt-4 text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Less timeline wrangling. More story.
          </h2>
        </div>

        <div
          data-reveal-group=""
          className="mt-12 grid max-w-[1040px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]"
        >
          <div className="glass rounded-lg p-5 sm:p-8">
            <h3 className="text-xl font-semibold tracking-[-0.01em] text-text-secondary">
              Editing by hand
            </h3>
            <ul className="mt-6 flex flex-col gap-4">
              {byHand.map((item) => (
                <li key={item} className="flex gap-3 text-md text-text-secondary">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-4 shrink-0 bg-border-strong"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="glass glass-accent-top rounded-lg p-5 sm:p-8">
            <h3 className="text-xl font-semibold tracking-[-0.01em] text-text-primary">
              Editing with Splic
            </h3>
            <ul className="mt-6 flex flex-col gap-4">
              {withSplic.map((item) => (
                <li key={item} className="flex gap-3 text-md text-text-primary">
                  <span
                    aria-hidden="true"
                    className="mt-2 h-px w-4 shrink-0 bg-accent-primary"
                  />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p data-reveal="" className="prose-page mt-10 text-lg text-text-secondary">
          Splic does the repetitive work. You keep the creative decisions.
        </p>
      </div>
    </section>
  );
}
