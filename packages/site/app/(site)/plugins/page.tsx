import type { Metadata } from "next";
import { PluginCard } from "@/components/plugins/plugin-card";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SectionHeading } from "@/components/ui/section-heading";
import { StateBlock } from "@/components/ui/state-block";
import { hasVerifiedPlugins, plugins } from "@/content/plugins";
import { waitlistHref } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Plugins",
  description:
    "Specialized editing workflows for gaming, podcasts, cinematic video and more, built to work inside Splic.",
};

export default function PluginsPage() {
  return (
    <main id="main" className="flex-1">
      <section
        aria-labelledby="plugins-page-heading"
        className="pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16"
      >
        <div className="container-page">
          <SectionHeading
            id="plugins-page-heading"
            asPageHeading
            title="Plugins for every kind of video."
            description="Specialized editing workflows that work inside Splic."
          />
        </div>
      </section>

      <section
        aria-labelledby="plugins-catalogue-heading"
        className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
      >
        <AmbientGlow variant="side-right" opacity={0.55} />
        <div className="container-page">
          <h2 id="plugins-catalogue-heading" className="sr-only">
            Plugin catalogue
          </h2>

          {hasVerifiedPlugins ? (
            <div data-reveal-group="" className="grid gap-4 md:grid-cols-2">
              {plugins.map((plugin) => (
                <PluginCard key={plugin.slug} plugin={plugin} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-8">
              <StateBlock
                kind="empty"
                title="Plugins are coming."
                description="No plugin has shipped yet. These planned workflows describe where plugins are headed."
                {...(waitlistHref
                  ? {
                      action: {
                        label: "Get notified when plugins launch",
                        href: waitlistHref,
                      },
                    }
                  : {})}
              />
              <div data-reveal-group="" className="grid gap-4 md:grid-cols-2">
                {plugins.map((plugin) => (
                  <PluginCard key={plugin.slug} plugin={plugin} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
