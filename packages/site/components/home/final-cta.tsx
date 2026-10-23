import { CtaSection } from "@/components/ui/cta-section";
import { ctaLabel, downloadHref } from "@/lib/site-config";

export function FinalCta() {
  return (
    <CtaSection
      id="download"
      heading="Your next edit starts with an idea."
      supporting="Bring a clip and a sentence. Splic handles more of the editing so you can focus on the story."
      primary={{ label: ctaLabel, href: downloadHref }}
      secondary={{ label: "Explore pricing", href: "/pricing" }}
    />
  );
}
