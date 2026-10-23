"use client";

import { useState } from "react";

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  items: FaqItem[];
  /** Id prefix to keep multiple accordions on one page unique. */
  idPrefix?: string;
}

/**
 * Single-open accessible accordion built on buttons with aria-expanded and
 * aria-controls. Enter/Space toggle; focus ring comes from the global rule.
 */
export function FaqAccordion({ items, idPrefix = "faq" }: FaqAccordionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div data-reveal-group="" className="flex flex-col gap-3">
      {items.map((item) => {
        const open = openId === item.id;
        const triggerId = `${idPrefix}-${item.id}-trigger`;
        const panelId = `${idPrefix}-${item.id}-panel`;

        return (
          <div key={item.id} className="glass rounded-lg px-5">
            <h3>
              <button
                type="button"
                id={triggerId}
                aria-expanded={open}
                aria-controls={panelId}
                className="flex w-full items-center justify-between gap-6 py-5 text-left text-md font-medium text-text-primary transition-colors hover:text-accent-hover"
                onClick={() => setOpenId(open ? null : item.id)}
              >
                <span>{item.question}</span>
                <span
                  aria-hidden="true"
                  className="relative flex h-4 w-4 shrink-0 items-center justify-center text-text-secondary"
                >
                  <span className="absolute h-px w-4 bg-current" />
                  <span
                    className="absolute h-4 w-px bg-current transition-transform duration-200"
                    style={{ transform: open ? "scaleY(0)" : "none" }}
                  />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="faq-panel"
              data-open={open}
            >
              <div>
                <p className="pb-6 pr-8 text-md text-text-secondary">
                  {item.answer}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
