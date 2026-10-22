import { Reveal } from "./reveal";
import { Section } from "./section";
import { SectionHeading } from "./section-heading";
import {
  DescribeVisual,
  ExecuteVisual,
  VerifyVisual,
} from "./step-visuals";

const steps = [
  {
    label: "01 / DESCRIBE",
    title: "Tell it what you want.",
    description:
      "Describe your intended story, pacing, style or changes in plain language.",
    Visual: DescribeVisual,
  },
  {
    label: "02 / EXECUTE",
    title: "Let Splic do the work.",
    description:
      "The agent plans the steps and operates supported editing tools to carry out the changes.",
    Visual: ExecuteVisual,
  },
  {
    label: "03 / VERIFY",
    title: "Check. Refine. Review.",
    description:
      "Splic inspects the available output, corrects issues where possible, and lets you review the result.",
    Visual: VerifyVisual,
  },
] as const;

export function HowItWorks() {
  return (
    <Section id="how-it-works" labelledBy="how-title" alt>
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="how-title"
            eyebrow="HOW IT WORKS"
            title="From instruction to finished edit."
          />
          <p className="lede mt-5 max-w-xl text-lg">
            A walkthrough of the planned Splic workflow, from your first
            instruction to the review of the result.
          </p>
        </Reveal>

        <ol className="mt-14 flex flex-col gap-14 md:mt-21 md:gap-21">
          {steps.map((step, index) => {
            const reversed = index % 2 === 1;

            return (
              <li key={step.label}>
                <Reveal>
                  <div className="grid items-center gap-8 md:grid-cols-2 md:gap-14">
                    <div
                      className={
                        reversed
                          ? "md:order-2 md:justify-self-end"
                          : "md:order-1"
                      }
                    >
                      <p className="eyebrow">{step.label}</p>
                      <h3 className="headline mt-4 text-2xl text-text-primary">
                        {step.title}
                      </h3>
                      <p className="lede mt-4 max-w-md text-lg">
                        {step.description}
                      </p>
                    </div>

                    <div
                      className={`min-w-0 ${
                        reversed ? "md:order-1" : "md:order-2"
                      }`}
                    >
                      <div className="border border-line bg-surface-strong/50 p-4">
                        <step.Visual />
                      </div>
                    </div>
                  </div>
                </Reveal>
              </li>
            );
          })}
        </ol>
      </div>
    </Section>
  );
}
