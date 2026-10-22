const mediaItems = [
  { name: "interview_a.mp4", meta: "04:12" },
  { name: "interview_b.mp4", meta: "03:47" },
  { name: "broll_coast_04.mp4", meta: "00:38" },
  { name: "broll_studio_01.mp4", meta: "01:02" },
  { name: "score_main.wav", meta: "02:55" },
];

const agentSteps = [
  { label: "Plan · 6 steps", state: "done" as const },
  { label: "Trim 4 silences", state: "done" as const },
  { label: "Rework opening", state: "done" as const },
  { label: "Inspect result", state: "active" as const },
  { label: "Apply corrections", state: "queued" as const },
];

const rulerMarks = [
  "00:00",
  "00:15",
  "00:30",
  "00:45",
  "01:00",
  "01:15",
  "01:30",
];

function Clip({
  label,
  width,
  selected = false,
}: {
  label: string;
  width: string;
  selected?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 items-center border px-2 py-1 ${
        selected
          ? "border-text-primary/35 bg-surface-raised/10"
          : "border-line-strong bg-surface-raised/[0.05]"
      }`}
      style={{ width }}
    >
      <span className="truncate font-mono text-xs text-text-secondary">
        {label}
      </span>
    </div>
  );
}

export function EditorShowcase() {
  return (
    <figure className="w-full">
      <div
        role="img"
        aria-label="Concept illustration of the Splic editing workspace: a video preview above a multi-track timeline, with a Splic agent panel carrying out a described edit."
        className="overflow-hidden border border-line-strong bg-surface-strong"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-3 border-b border-line bg-surface-strong px-4 py-2.5">
          <span className="flex gap-2" aria-hidden="true">
            <span className="h-2.5 w-2.5 rounded-full bg-surface-raised/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-raised/20" />
            <span className="h-2.5 w-2.5 rounded-full bg-surface-raised/20" />
          </span>
          <span className="truncate font-mono text-sm text-text-tertiary">
            splic — coastal-recut
          </span>
          <span className="ml-auto hidden rounded-xs border border-line-strong px-3 py-1 font-mono text-xs uppercase tracking-[0.18em] text-text-tertiary sm:block">
            Concept
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[11.5rem_minmax(0,1fr)_16rem]">
          {/* Media pool */}
          <div className="hidden border-r border-line bg-surface-muted lg:block">
            <div className="border-b border-line px-4 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
              Media
            </div>
            <ul className="flex flex-col gap-1 p-3">
              {mediaItems.map((item, index) => (
                <li
                  key={item.name}
                  className={`flex items-center justify-between gap-2 px-2 py-1 ${
                    index === 2 ? "bg-surface-raised/[0.06]" : ""
                  }`}
                >
                  <span className="truncate font-mono text-xs text-text-secondary">
                    {item.name}
                  </span>
                  <span className="shrink-0 font-mono text-xs text-text-tertiary">
                    {item.meta}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-1 border-t border-line px-4 py-2.5 font-mono text-xs text-text-tertiary">
              + Import
            </div>
          </div>

          {/* Preview */}
          <div className="min-w-0">
            <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-b from-surface-strong to-surface-base">
              <div className="grid-fade absolute inset-0 opacity-70" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.55)_100%)]" />

              {/* Frame guides */}
              <div className="absolute inset-6 border border-text-primary/[0.07]" />
              <span className="absolute left-4 top-4 h-4 w-4 border-l border-t border-text-primary/20" />
              <span className="absolute right-4 top-4 h-4 w-4 border-r border-t border-text-primary/20" />
              <span className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-text-primary/20" />
              <span className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-text-primary/20" />

              <span className="absolute left-4 top-4 font-mono text-xs tracking-[0.14em] text-text-primary/45">
                PROGRAM
              </span>
              <span className="absolute bottom-4 right-4 font-mono text-xs text-text-primary/45">
                00:00:12:04
              </span>
            </div>

            {/* Transport */}
            <div className="flex items-center gap-3 border-t border-line bg-surface-base px-3 py-2.5 sm:gap-4 sm:px-4">
              <span
                className="flex items-center gap-2 text-text-secondary"
                aria-hidden="true"
              >
                <svg width="9" height="10" viewBox="0 0 9 10" fill="currentColor">
                  <path d="M0 0l9 5-9 5z" />
                </svg>
              </span>
              <span className="hidden items-center gap-3 font-mono text-xs text-text-tertiary sm:flex">
                <span>00:00:12:04</span>
                <span className="text-text-tertiary">/</span>
                <span>00:01:48:12</span>
              </span>
              <span className="ml-auto flex items-center gap-2">
                <span className="border border-line-strong px-2 py-1 font-mono text-xs text-text-tertiary">
                  FIT
                </span>
                <span className="border border-line-strong px-2 py-1 font-mono text-xs text-text-tertiary">
                  1080P
                </span>
              </span>
            </div>
          </div>

          {/* Agent panel */}
          <div className="min-w-0 border-t border-line bg-surface-muted lg:border-l lg:border-t-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
              <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
                Splic agent
              </span>
              <span className="flex items-center gap-2 font-mono text-xs text-text-secondary">
                <span className="pulse-dot h-2 w-2 rounded-full bg-surface-raised/80" />
                WORKING
              </span>
            </div>

            <div className="p-3">
              <div className="border border-line-strong bg-surface-base px-3 py-2.5">
                <p className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
                  Instruction
                </p>
                <p className="mt-2 text-md text-text-primary">
                  Cut the dead air, tighten the opening to 12 seconds, and
                  caption the second section.
                </p>
              </div>

              <ol className="mt-3 flex flex-col gap-1">
                {agentSteps.map((step) => (
                  <li
                    key={step.label}
                    className={`flex items-center gap-2 px-2 py-1 text-md ${
                      step.state === "active"
                        ? "bg-surface-raised/[0.05] text-text-primary"
                        : step.state === "queued"
                          ? "text-text-tertiary"
                          : "text-text-secondary"
                    }`}
                  >
                    <span
                      className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-xs leading-none ${
                        step.state === "done"
                          ? "border-text-primary/30 text-text-primary/80"
                          : step.state === "active"
                            ? "border-text-primary/50"
                            : "border-line-strong"
                      }`}
                    >
                      {step.state === "done" ? "✓" : null}
                      {step.state === "active" ? (
                        <span className="pulse-dot h-1 w-1 rounded-full bg-surface-raised" />
                      ) : null}
                    </span>
                    <span className="truncate">{step.label}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-3 border-t border-line pt-2.5">
                <div className="flex items-center justify-between font-mono text-xs text-text-tertiary">
                  <span>STEP 3 / 5</span>
                  <span>INSPECTING</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-raised/[0.08]">
                  <div className="h-full w-3/5 rounded-full bg-surface-raised/70" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="overflow-x-auto border-t border-line bg-surface-muted">
          <div className="relative min-w-[34rem] px-4 pb-4 pt-3">
            <div className="flex font-mono text-xs text-text-tertiary">
              {rulerMarks.map((mark) => (
                <span
                  key={mark}
                  className="flex-1 border-l border-line px-2 leading-none"
                >
                  {mark}
                </span>
              ))}
            </div>

            <div className="relative mt-2.5 flex flex-col gap-2">
              {/* Playhead */}
              <span className="pointer-events-none absolute -top-1 bottom-0 left-[34%] z-10 w-px bg-surface-raised/70">
                <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-surface-raised" />
              </span>

              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
                  V2
                </span>
                <div className="flex min-w-0 flex-1 gap-1">
                  <Clip label="broll_coast_04" width="24%" />
                  <Clip label="titles_open" width="16%" />
                  <Clip label="broll_studio_01" width="20%" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
                  V1
                </span>
                <div className="flex min-w-0 flex-1 gap-1">
                  <Clip label="interview_a" width="34%" />
                  <Clip label="interview_b" width="28%" selected />
                  <Clip label="interview_c" width="24%" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
                  A1
                </span>
                <div className="waveform h-5.5 min-w-0 flex-1 border border-line-strong bg-surface-base opacity-80" />
              </div>

              <div className="flex items-center gap-2">
                <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
                  A2
                </span>
                <div className="flex min-w-0 flex-1 gap-1">
                  <div className="waveform h-5.5 min-w-0 flex-1 border border-line-strong bg-surface-base opacity-50" />
                  <div className="h-5.5 w-[18%] shrink-0 border border-line-strong bg-surface-raised/[0.05]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="mt-4 text-center text-sm tracking-[0.02em] text-text-tertiary">
        Concept interface — Splic is in development and the workspace shown is
        illustrative.
      </figcaption>
    </figure>
  );
}
