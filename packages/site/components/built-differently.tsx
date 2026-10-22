import { Reveal } from "./reveal";
import { Section } from "./section";
import { SectionHeading } from "./section-heading";

const features = [
  {
    title: "Your workspace stays yours",
    description: "Keep access to the editor and your creative decisions.",
  },
  {
    title: "Designed for iteration",
    description: "Editing can involve multiple tool calls, checks and corrections.",
  },
  {
    title: "Local execution, cloud reasoning",
    description:
      "The planned architecture runs the editor and agent runtime locally while using cloud AI APIs for reasoning.",
  },
];

function WorkspaceAgentVisual() {
  return (
    <figure className="w-full">
      <div
        role="img"
        aria-label="Concept illustration of the planned relationship between the editing workspace and the Splic agent: the agent reads the timeline and applies supported editing actions while the workspace stays open."
        className="overflow-hidden border border-line-strong bg-surface-strong"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
          <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
            Workspace + agent
          </span>
          <span className="rounded-xs border border-line-strong px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-text-tertiary">
            Concept
          </span>
        </div>

        <div className="grid md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)]">
          {/* Editing workspace */}
          <div className="p-4 md:p-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
              Editing workspace
            </p>
            <div className="relative mt-3 aspect-video overflow-hidden border border-line-strong bg-gradient-to-b from-surface-strong to-surface-base">
              <div className="grid-fade absolute inset-0 opacity-60" />
              <div className="absolute inset-4 border border-text-primary/[0.06]" />
              <span className="absolute bottom-2 right-3 font-mono text-xs text-text-primary/40">
                00:00:12:04
              </span>
            </div>
            <div className="mt-3 flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
                  V1
                </span>
                <div className="flex min-w-0 flex-1 gap-1">
                  <div className="h-6 w-[30%] border border-line-strong bg-surface-raised/[0.05]" />
                  <div className="h-6 w-[26%] border border-text-primary/30 bg-surface-raised/10" />
                  <div className="h-6 w-[20%] border border-line-strong bg-surface-raised/[0.05]" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
                  A1
                </span>
                <div className="waveform h-6 min-w-0 flex-1 border border-line-strong bg-surface-base opacity-60" />
              </div>
            </div>
          </div>

          {/* Connector */}
          <div className="flex flex-col items-center justify-center gap-3 px-4 py-5 md:px-3 md:py-6">
            <span
              className="hidden w-px flex-1 border-l border-dashed border-line-strong md:block"
              aria-hidden="true"
            />
            <span
              className="h-px w-full border-t border-dashed border-line-strong md:hidden"
              aria-hidden="true"
            />
            <span className="rounded-xs border border-line-strong bg-surface-base px-3 py-1 font-mono text-xs tracking-[0.14em] text-text-tertiary">
              READS &amp; EDITS
            </span>
            <span
              className="hidden w-px flex-1 border-l border-dashed border-line-strong md:block"
              aria-hidden="true"
            />
            <span
              className="h-px w-full border-t border-dashed border-line-strong md:hidden"
              aria-hidden="true"
            />
          </div>

          {/* Agent */}
          <div className="border-t border-line bg-surface-base p-4 md:border-l md:border-t-0 md:p-5">
            <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
              Splic agent
            </p>
            <div className="mt-3 border border-line-strong bg-surface-base px-3 py-2.5">
              <p className="text-md text-text-primary">
                Tighten the opening and fix the caption overlap in section two.
              </p>
            </div>
            <ul className="mt-3 flex flex-col gap-1 font-mono text-md text-text-secondary">
              <li className="flex items-center gap-2 px-2 py-1">
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-text-primary/30 text-xs text-text-primary/80">
                  ✓
                </span>
                read_timeline()
              </li>
              <li className="flex items-center gap-2 px-2 py-1">
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-text-primary/30 text-xs text-text-primary/80">
                  ✓
                </span>
                trim_clip(intro)
              </li>
              <li className="flex items-center gap-2 bg-surface-raised/[0.05] px-2 py-1 text-text-primary">
                <span className="flex h-3 w-3 shrink-0 items-center justify-center rounded-full border border-text-primary/50">
                  <span className="pulse-dot h-1 w-1 rounded-full bg-surface-raised" />
                </span>
                fix_captions(section=2)
              </li>
            </ul>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-sm tracking-[0.02em] text-text-tertiary">
        Planned direction — Splic is in development. The workspace, agent
        actions and architecture shown are intended behaviour, not shipped
        features.
      </figcaption>
    </figure>
  );
}

export function BuiltDifferently() {
  return (
    <Section id="built-differently" labelledBy="built-title">
      <div className="container-page">
        <Reveal>
          <SectionHeading
            id="built-title"
            eyebrow="BUILT DIFFERENTLY"
            title="An agent that edits. Not just one that answers."
            description="Splic is designed around real editing actions, not just suggestions in a chat window. The editor remains accessible, and you retain the ability to review and adjust your work."
          />
        </Reveal>

        <Reveal delay={100} className="mt-14">
          <WorkspaceAgentVisual />
        </Reveal>

        <ul className="mt-14 grid gap-x-8 gap-y-14 md:grid-cols-3 md:gap-8">
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
