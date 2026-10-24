import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";

const localItems = ["Project folder", "Editor", "Agent"];
const cloudItems = ["Extra capacity", "Cloud-based features"];

export function LocalCloud() {
  return (
    <section
      id="local-cloud"
      aria-labelledby="local-cloud-heading"
      className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
    >
      <AmbientGlow variant="side-right" opacity={0.5} />
      <div className="container-page">
        <div data-reveal="" className="max-w-[640px]">
          <h2
            id="local-cloud-heading"
            className="headline text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Your workspace stays yours.
          </h2>
          <p className="lede mt-5">
            Work with your local projects and use cloud storage when you need
            the additional capacity or cloud-based functionality offered by
            your plan.
          </p>
        </div>

        <div
          data-reveal-group=""
          className="mt-10 flex flex-col items-stretch gap-4 lg:flex-row lg:items-center lg:gap-0"
        >
          <div className="glass flex-1 rounded-lg p-6 lg:rounded-r-none">
            <h3 className="text-md font-semibold text-text-primary">
              On your computer
            </h3>
            <ul className="mt-4 flex flex-col gap-2">
              {localItems.map((item) => (
                <li key={item} className="text-md text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div
            aria-hidden="true"
            className="self-center mx-6 h-px w-auto border-t border-dashed border-border-default lg:mx-0 lg:h-12 lg:w-px lg:self-auto lg:border-t-0 lg:border-l lg:border-dashed"
          />

          <div className="glass flex-1 rounded-lg p-6 lg:rounded-l-none">
            <div className="flex items-center gap-3">
              <h3 className="text-md font-semibold text-text-primary">
                Optional cloud storage
              </h3>
              <StatusBadge>Optional</StatusBadge>
            </div>
            <ul className="mt-4 flex flex-col gap-2">
              {cloudItems.map((item) => (
                <li key={item} className="text-md text-text-secondary">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <p data-reveal="" className="mt-6 text-md text-text-tertiary">
          Cloud storage is never required for local editing.
        </p>

        <div data-reveal="" className="mt-8">
          <Button href="/pricing" variant="secondary" size="lg">
            Explore plans
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
