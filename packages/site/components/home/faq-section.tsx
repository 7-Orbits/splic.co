import { FaqAccordion } from "@/components/ui/faq-accordion";
import { faqs } from "@/content/faq";

export function FaqSection() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="py-8 md:py-12 lg:py-16"
    >
      <div className="container-page">
        <div data-reveal="" className="max-w-[640px]">
          <h2
            id="faq-heading"
            className="headline text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            Questions, answered plainly.
          </h2>
        </div>
        <div className="mt-10 max-w-[800px]">
          <FaqAccordion items={faqs} idPrefix="home-faq" />
        </div>
      </div>
    </section>
  );
}
