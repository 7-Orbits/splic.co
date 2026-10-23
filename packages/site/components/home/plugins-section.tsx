import type { ReactNode } from "react";
import { Reveal } from "@/components/reveal";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ui/status-badge";
import { hasVerifiedPlugins, plugins } from "@/content/plugins";

/** Layered timeline with one highlighted clip and a playhead — gaming motif. */
function GamingMotif() {
  const clips = [
    { grow: 2, on: false },
    { grow: 1, on: false },
    { grow: 3, on: true },
    { grow: 1, on: false },
    { grow: 2, on: false },
  ];
  const audio = [60, 90, 45, 100, 70, 85, 55, 75, 50, 80];

  return (
    <div
      aria-hidden="true"
      data-motif="gaming"
      className="relative flex h-40 w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-surface-primary p-4"
    >
      <span className="pointer-events-none absolute -top-4 left-[32%] h-24 w-44 rounded-full bg-accent-primary/10 blur-2xl" />
      <div className="relative flex flex-1 flex-col">
        <div className="flex items-end gap-2 border-b border-border-subtle pb-1.5">
          {Array.from({ length: 14 }, (_, index) => (
            <span
              key={index}
              className={`w-px bg-border-default ${index % 4 === 0 ? "h-2.5" : "h-1.5"}`}
            />
          ))}
        </div>
        <div className="relative mt-3 flex h-9 gap-1">
          {clips.map((clip, index) => (
            <span
              key={index}
              style={{ flexGrow: clip.grow }}
              data-gaming-highlight={clip.on ? "" : undefined}
              className={
                clip.on
                  ? "rounded-sm border border-accent-primary/60 bg-accent-primary/15"
                  : "rounded-sm border border-border-default bg-surface-elevated"
              }
            />
          ))}
          <span
            data-gaming-playhead=""
            className="pointer-events-none absolute -top-2 bottom-0 left-[42%] w-px bg-accent-primary"
          />
          <span
            data-gaming-playhead=""
            className="pointer-events-none absolute -top-[7px] left-[42%] h-2 w-2 -translate-x-1/2 rotate-45 bg-accent-primary"
          />
        </div>
        <div className="mt-1.5 flex h-4 items-end gap-1">
          {audio.map((height, index) => (
            <span
              key={index}
              style={{ height: `${height}%` }}
              className="w-1 rounded-full bg-accent-secondary/60"
            />
          ))}
        </div>
        <span className="mt-auto self-end pt-3 font-mono text-md text-text-tertiary">
          highlight pass
        </span>
      </div>
    </div>
  );
}

/** Centre-mirrored waveform with a faded dead-air region — podcast motif. */
function PodcastMotif() {
  const heights = [
    45, 70, 95, 60, 80, 100, 55, 85, 40, 65, 90, 50, 75, 35, 95, 60, 85, 45,
    70, 50,
  ];

  return (
    <div
      aria-hidden="true"
      data-motif="podcast"
      className="relative flex h-40 w-full flex-col overflow-hidden rounded-md border border-border-subtle bg-surface-primary p-4"
    >
      <div className="relative flex flex-1 items-center justify-between">
        <span className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-border-subtle" />
        {heights.map((height, index) => (
          <span
            key={index}
            data-podcast-bar=""
            className="w-1.5 rounded-full bg-accent-secondary/70"
            style={{ height: `${height}%` }}
          />
        ))}
        <span className="pointer-events-none absolute inset-y-0 left-[38%] w-[13%] border-x border-dashed border-border-default bg-surface-base/70" />
      </div>
      <div className="mt-2 flex justify-end">
        <span className="font-mono text-md text-text-tertiary">
          episode cut
        </span>
      </div>
    </div>
  );
}

/** 2.39:1 letterbox strip with sprocket holes and a colour grade — cinematic motif. */
function CinematicMotif() {
  return (
    <div
      aria-hidden="true"
      data-motif="cinematic"
      className="relative flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-border-subtle bg-surface-base"
    >
      <span className="pointer-events-none absolute -bottom-6 left-[30%] h-20 w-40 rounded-full bg-accent-warning/10 blur-2xl" />
      <div className="relative aspect-[2.39/1] w-[min(calc(100%_-_3rem),250px)] overflow-hidden rounded-xs border border-border-default bg-surface-primary">
        <div
          data-cinematic-perf=""
          className="absolute inset-y-0 left-3 right-3 overflow-hidden"
        >
          <span
            data-cinematic-grade=""
            className="absolute inset-0 bg-gradient-to-r from-accent-secondary/25 via-accent-primary/10 to-accent-warning/25"
          />
          <span className="absolute inset-x-0 bottom-[38%] h-px bg-text-primary/15" />
          <span className="absolute left-[58%] top-[26%] h-5 w-5 rounded-full bg-accent-warning/40 blur-md" />
        </div>
        <span className="absolute inset-y-0 left-0 flex w-3 flex-col items-center justify-around border-r border-border-subtle bg-surface-base py-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="h-1.5 w-1.5 rounded-xs bg-border-default/80" />
          ))}
        </span>
        <span className="absolute inset-y-0 right-0 flex w-3 flex-col items-center justify-around border-l border-border-subtle bg-surface-base py-1">
          {Array.from({ length: 5 }, (_, index) => (
            <span key={index} className="h-1.5 w-1.5 rounded-xs bg-border-default/80" />
          ))}
        </span>
        <span className="pointer-events-none absolute inset-3 border border-text-primary/10" />
      </div>
      <span className="absolute bottom-1.5 right-3 font-mono text-md text-text-tertiary">
        2.39:1
      </span>
    </div>
  );
}

function PlannedPanel({
  name,
  audience,
  problem,
  motif,
  featured = false,
}: {
  name: string;
  audience: string;
  problem: string;
  motif: ReactNode;
  featured?: boolean;
}) {
  return (
    <div
      className={`glass glass-interactive flex h-full flex-col rounded-lg ${
        featured ? "p-6 lg:p-8" : "p-6"
      }`}
    >
      <div
        className={
          featured
            ? "grid h-full items-center gap-6 lg:grid-cols-2 lg:gap-8"
            : "flex h-full flex-col"
        }
      >
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone="warn" className="gap-1.5 tracking-[-0.005em]">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-accent-warning"
              />
              Planned
            </StatusBadge>
            <span className="text-md text-text-tertiary">{audience}</span>
          </div>
          <h3
            className={`mt-4 font-semibold tracking-[-0.01em] text-text-primary ${
              featured ? "text-2xl" : "text-xl"
            }`}
          >
            {name}
          </h3>
          <p className="mt-3 text-md text-text-secondary">{problem}</p>
        </div>
        <div className={featured ? "" : "mt-auto pt-5"}>{motif}</div>
      </div>
    </div>
  );
}

export function PluginsSection() {
  const [gaming, podcast, cinematic] = plugins;

  return (
    <section
      id="plugins"
      aria-labelledby="plugins-heading"
      className="relative isolate overflow-clip py-8 md:py-12 lg:py-16"
    >
      <AmbientGlow variant="side-right" opacity={0.7} />
      <div className="container-page">
        <Reveal className="max-w-[640px]">
          <p className="eyebrow">Plugins</p>
          <h2
            id="plugins-heading"
            className="headline mt-4 text-section text-text-primary"
            style={{ letterSpacing: "-0.025em" }}
          >
            The right workflow for the video you want to make.
          </h2>
          <p className="lede mt-5">
            Splic plugins bring specialized editing capabilities to different
            creative workflows, helping you spend less time specifying every
            detail and more time shaping the result.
          </p>
        </Reveal>

        {hasVerifiedPlugins ? null : (
          <Reveal delay={80}>
            <p className="mt-2 text-md text-text-tertiary">
              Planned workflows — no plugin has shipped yet.
            </p>
          </Reveal>
        )}

        <ul
          data-reveal-group=""
          className="mt-12 grid gap-5 lg:grid-cols-2"
        >
          <li className="min-w-0 lg:col-span-2">
            <PlannedPanel
              name={gaming.name}
              audience={gaming.audience}
              problem={gaming.problem}
              motif={<GamingMotif />}
              featured
            />
          </li>
          <li className="min-w-0">
            <PlannedPanel
              name={podcast.name}
              audience={podcast.audience}
              problem={podcast.problem}
              motif={<PodcastMotif />}
            />
          </li>
          <li className="min-w-0">
            <PlannedPanel
              name={cinematic.name}
              audience={cinematic.audience}
              problem={cinematic.problem}
              motif={<CinematicMotif />}
            />
          </li>
        </ul>

        <Reveal delay={80}>
          <p className="prose-page mt-10 text-md text-text-secondary">
            A general-purpose agent can do general things. Plugins give Splic
            specialized knowledge of how a gaming highlight, a podcast episode
            or a cinematic sequence is actually cut.
          </p>
        </Reveal>

        <div className="mt-8">
          <Button href="/plugins" variant="secondary" size="lg">
            Explore plugins
            <span aria-hidden="true">→</span>
          </Button>
        </div>
      </div>
    </section>
  );
}
