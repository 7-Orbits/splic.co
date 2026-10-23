import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PluginCard } from "@/components/plugins/plugin-card";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { ScreenshotFrame } from "@/components/ui/screenshot-frame";
import { StatusBadge, type BadgeTone } from "@/components/ui/status-badge";
import {
  getPlugin,
  pluginStatusLabels,
  plugins,
  type PluginStatus,
} from "@/content/plugins";

const toneByStatus: Record<PluginStatus, BadgeTone> = {
  free: "ok",
  included: "accent",
  premium: "info",
  planned: "warn",
  unavailable: "error",
};

interface PluginDetailProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return plugins.map((plugin) => ({ slug: plugin.slug }));
}

export async function generateMetadata({
  params,
}: PluginDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) return { title: "Plugin not found" };
  return {
    title: plugin.name,
    description: plugin.summary,
  };
}

export default async function PluginDetailPage({ params }: PluginDetailProps) {
  const { slug } = await params;
  const plugin = getPlugin(slug);
  if (!plugin) notFound();

  const related = plugin.related
    .map((relatedSlug) => getPlugin(relatedSlug))
    .filter((relatedPlugin) => relatedPlugin !== undefined)
    .slice(0, 3);

  const primaryAction = (() => {
    switch (plugin.status) {
      case "free":
        return { label: "Download Splic", href: "/download", disabled: false };
      case "included":
        return { label: "View plans", href: "/pricing", disabled: false };
      case "premium":
        return { label: "View pricing", href: "/pricing", disabled: false };
      case "planned":
      case "unavailable":
      default:
        return null;
    }
  })();

  return (
    <main id="main" className="flex-1">
      <section
        aria-labelledby="plugin-heading"
        className="relative isolate overflow-clip pt-20 pb-8 md:pb-12 lg:pt-28 lg:pb-16"
      >
        <AmbientGlow variant="side-right" opacity={0.55} />
        <div className="container-page">
          <p className="text-md text-text-tertiary">
            <Link
              href="/plugins"
              className="transition-colors hover:text-text-primary"
            >
              Plugins
            </Link>
            <span aria-hidden="true" className="mx-2">
              /
            </span>
            {plugin.name}
          </p>
          <div className="mt-6 flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div data-reveal="" className="max-w-[640px]">
              <div className="flex items-center gap-3">
                <StatusBadge tone={toneByStatus[plugin.status]}>
                  {pluginStatusLabels[plugin.status]}
                </StatusBadge>
              </div>
              <h1
                id="plugin-heading"
                className="headline mt-4 text-page text-text-primary"
                style={{ letterSpacing: "-0.03em" }}
              >
                {plugin.name}
              </h1>
              <p className="lede mt-5">{plugin.summary}</p>
              <p className="mt-3 text-md text-text-secondary">
                {plugin.audience}
              </p>
            </div>
            <div
              data-reveal=""
              className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
            >
              {primaryAction ? (
                <Button href={primaryAction.href} size="lg">
                  {primaryAction.label}
                </Button>
              ) : (
                <Button size="lg" aria-disabled="true" disabled>
                  Coming soon
                </Button>
              )}
            </div>
          </div>
          {!primaryAction ? (
            <p className="mt-4 text-md text-text-tertiary">
              This workflow hasn&apos;t shipped yet. There is nothing to
              install or purchase.
            </p>
          ) : null}
        </div>
      </section>

      {plugin.previewSrc ? (
        <section
          aria-label="Plugin preview"
          className="py-8 md:py-12 lg:py-16"
        >
          <div className="container-page">
            <ScreenshotFrame
              src={plugin.previewSrc}
              alt={plugin.previewAlt ?? `${plugin.name} preview`}
              aspect="16 / 10"
            />
          </div>
        </section>
      ) : null}

      {plugin.capabilitiesVerified && plugin.examplePrompt ? (
        <section
          id="example"
          aria-labelledby="example-heading"
          className="py-8 md:py-12 lg:py-16"
        >
          <div className="container-page">
            <div data-reveal="" className="max-w-[640px]">
              <h2
                id="example-heading"
                className="headline text-section text-text-primary"
                style={{ letterSpacing: "-0.025em" }}
              >
                Example workflow
              </h2>
              <blockquote className="glass mt-6 rounded-lg px-4 py-3 text-md text-text-primary">
                “{plugin.examplePrompt}”
              </blockquote>
              {plugin.exampleOutcome ? (
                <p className="lede mt-5">{plugin.exampleOutcome}</p>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      <section
        id="access"
        aria-labelledby="access-heading"
        className="py-8 md:py-12 lg:py-16"
      >
        <div className="container-page">
          <div data-reveal="" className="max-w-[640px]">
            <h2
              id="access-heading"
              className="headline text-section text-text-primary"
              style={{ letterSpacing: "-0.025em" }}
            >
              Access
            </h2>
            <p className="lede mt-5">
              {plugin.status === "planned"
                ? "This plugin hasn't been released. When it ships, access details — free, included with a plan, or premium — will be listed here."
                : plugin.status === "free"
                  ? "Available in Splic."
                  : plugin.status === "included"
                    ? "Included with a paid editing plan. See Pricing for which plans qualify."
                    : plugin.status === "premium"
                      ? `Premium plugin${
                          plugin.priceMonthly !== undefined
                            ? ` — $${plugin.priceMonthly}/month`
                            : ""
                        }. Requirements and purchase options are confirmed at launch.`
                      : "Currently unavailable."}
            </p>
          </div>
        </div>
      </section>

      {related.length > 0 ? (
        <section
          aria-labelledby="related-heading"
          className="py-8 md:py-12 lg:py-16"
        >
          <div className="container-page">
            <h2
              id="related-heading"
              data-reveal=""
              className="headline text-section text-text-primary"
              style={{ letterSpacing: "-0.025em" }}
            >
              Related plugins
            </h2>
            <div
              data-reveal-group=""
              className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            >
              {related.map((relatedPlugin) => (
                <PluginCard key={relatedPlugin.slug} plugin={relatedPlugin} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
