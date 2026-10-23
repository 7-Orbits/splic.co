import { FaqSection } from "@/components/home/faq-section";
import { FinalCta } from "@/components/home/final-cta";
import { Hero } from "@/components/home/hero";
import { LocalCloud } from "@/components/home/local-cloud";
import { PluginsSection } from "@/components/home/plugins-section";
import { PricingTeaser } from "@/components/home/pricing-teaser";
import { ValueComparison } from "@/components/home/value-comparison";
import { WorkflowShowcase } from "@/components/home/workflow-showcase";

export default function Home() {
  return (
    <main id="main" className="flex-1">
      <Hero />
      <WorkflowShowcase />
      <PluginsSection />
      <ValueComparison />
      <LocalCloud />
      <PricingTeaser />
      <FaqSection />
      <FinalCta />
    </main>
  );
}
