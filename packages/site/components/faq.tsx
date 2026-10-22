"use client";

import { useId, useState } from "react";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { SectionHeading } from "./section-heading";

const faqs = [
  {
    question: "Is Splic a video editor or an AI assistant?",
    answer:
      "Splic is planned as a desktop video-editing product with an AI agent that can perform supported editing operations.",
  },
  {
    question: "Will I still be able to edit manually?",
    answer:
      "Yes. Keeping the actual editor accessible and the user in control is a core part of the intended experience.",
  },
  {
    question: "Does Splic run a large AI model on my computer?",
    answer:
      "The planned architecture uses cloud AI APIs for reasoning, while the editor and agent runtime run locally. Cloud API usage may incur costs depending on the plan.",
  },
  {
    question: "Which operating systems will be supported?",
    answer:
      "Linux, Windows and macOS are target platforms, subject to the selected editor's compatibility and testing.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const baseId = useId();

  return (
    <Section id="faq" labelledBy="faq-title" alt>
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="faq-title"
            eyebrow="FAQ"
            title="A few things worth knowing."
          />
        </Reveal>

        <Reveal delay={80} className="mt-14">
          <div className="border-y border-line">
            {faqs.map((item, index) => {
              const open = openIndex === index;
              const buttonId = `${baseId}-button-${index}`;
              const panelId = `${baseId}-panel-${index}`;

              return (
                <div
                  key={item.question}
                  className={index > 0 ? "border-t border-line" : ""}
                >
                  <h3>
                    <button
                      type="button"
                      id={buttonId}
                      className="flex w-full items-center justify-between gap-8 py-6 text-left"
                      aria-expanded={open}
                      aria-controls={panelId}
                      onClick={() => setOpenIndex(open ? null : index)}
                    >
                      <span className="text-2xl tracking-[-0.01em] text-text-primary">
                        {item.question}
                      </span>
                      <span
                        className="relative flex h-5 w-5 shrink-0 items-center justify-center text-text-secondary"
                        aria-hidden="true"
                      >
                        <span className="faq-icon-horizontal absolute h-px w-3.5" />
                        <span
                          className="faq-icon-vertical absolute h-3.5 w-px"
                          data-collapsed={open ? "true" : "false"}
                        />
                      </span>
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="faq-panel"
                    data-open={open ? "true" : "false"}
                  >
                    <div>
                      <p className="lede max-w-2xl pb-6 pr-14 text-lg">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
