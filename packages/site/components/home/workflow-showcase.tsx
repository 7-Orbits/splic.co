"use client";

import { useEffect, useRef, useState } from "react";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { WorkspaceMock } from "./agent-demo";
import { showcaseStages } from "@/content/workflow";

/**
 * Screen Studio-style product narrative: a sticky workspace preview whose
 * stage follows the step crossing the viewport center. Desktop only uses
 * stickiness; mobile renders a natural stacked list. Scroll is never
 * hijacked, and reduced-motion users get plain state changes.
 */
export function WorkflowShowcase() {
  const stepsRef = useRef<HTMLOListElement>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const root = stepsRef.current;
    if (!root) return;

    const items = Array.from(
      root.querySelectorAll<HTMLElement>("[data-stage-item]"),
    );
    if (items.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const index = items.indexOf(entry.target as HTMLElement);
          if (index >= 0) setActive(index);
        }
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: 0 },
    );

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  const activeStage = showcaseStages[active]?.mockStage ?? "review";

  return (
    <section
      id="editing-workflow"
      aria-labelledby="editing-workflow-heading"
      className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
    >
      <AmbientGlow variant="side-left" opacity={0.45} />
      <div className="container-page">
        <div data-reveal="" className="max-w-[640px]">
          <p className="eyebrow">Workflow</p>
          <h2
            id="editing-workflow-heading"
            className="headline mt-4 text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            From instruction to finished edit.
          </h2>
          <p className="lede mt-5">
            Describe the change in plain language. Splic reads the timeline,
            makes supported changes, and hands the result back for your
            review.
          </p>
        </div>

        <div className="mt-12 lg:mt-16 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <ol
            ref={stepsRef}
            data-reveal-group=""
            className="flex flex-col"
          >
            {showcaseStages.map((stage, index) => {
              const isActive = index === active;
              return (
                <li
                  key={stage.id}
                  data-stage-item=""
                  className={`border-l-2 py-8 pl-6 transition-colors duration-200 lg:flex lg:min-h-[44vh] lg:flex-col lg:justify-center lg:py-10 ${
                    isActive
                      ? "border-accent-primary"
                      : "border-border-subtle"
                  }`}
                >
                  <p
                    className={`eyebrow transition-colors duration-200 ${
                      isActive ? "text-accent-primary" : ""
                    }`}
                  >
                    {stage.number} · {stage.kicker}
                  </p>
                  <h3
                    className={`mt-3 text-2xl font-semibold tracking-[-0.01em] transition-colors duration-200 ${
                      isActive ? "text-text-primary" : "text-text-secondary"
                    }`}
                  >
                    {stage.title}
                  </h3>
                  <p className="mt-3 max-w-[420px] text-md text-text-secondary">
                    {stage.body}
                  </p>
                </li>
              );
            })}
          </ol>

          {/* Sticky preview on desktop; static block after the steps on
              mobile so nothing crowds a small viewport. The outer div is
              the grid item; stickiness lives on an inner wrapper. */}
          <div className="mt-10 min-w-0 overflow-clip lg:mt-0">
            <div className="lg:sticky lg:top-28">
              <WorkspaceMock stage={activeStage} compact />
              <p className="mt-3 text-md text-text-tertiary">
                Illustrative workspace — stage changes as you read; the
                interface shown is not a real screenshot.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
