import { Reveal } from "./reveal";
import { Section } from "./section";
import { SectionHeading } from "./section-heading";

const features = [
  {
    title: "Describe your vision",
    description: "Explain the edit in plain language.",
  },
  {
    title: "Keep the editor",
    description: "Work within a real editing workspace.",
  },
  {
    title: "Inspect the result",
    description: "Check output and identify issues.",
  },
  {
    title: "Refine the edit",
    description: "Correct issues and review again.",
  },
];

export function Idea() {
  return (
    <Section id="features" labelledBy="idea-title">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="idea-title"
            eyebrow="THE IDEA"
            title="Your ideas move faster than your timeline."
            description="Editing means making dozens of small decisions — cutting clips, arranging scenes, adjusting audio and reviewing every change. Splic aims to take more of that repetitive work off your hands, so you can focus on the story."
          />
        </Reveal>

        <ul className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <li key={feature.title} className="border-t border-line-strong pt-5">
              <Reveal delay={index * 70}>
                <h3 className="text-2xl tracking-[-0.01em] text-text-primary">
                  {feature.title}
                </h3>
                <p className="mt-2 text-lg text-text-secondary">
                  {feature.description}
                </p>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  );
}
