import type { MockStage } from "@/content/workflow";

const mediaItems = [
  { name: "interview_a.mp4", meta: "04:12" },
  { name: "interview_b.mp4", meta: "03:47" },
  { name: "broll_coast_04.mp4", meta: "00:38" },
  { name: "broll_studio_01.mp4", meta: "01:02" },
  { name: "score_main.wav", meta: "02:55" },
];

const stepLabels = [
  "Plan · 5 steps",
  "Trim 4 silences",
  "Rework opening",
  "Inspect result",
  "Apply corrections",
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

const instructionText =
  "Cut the dead air, tighten the opening to 12 seconds, and caption the second section.";

/** Two-tone thumbnail strips — deterministic per clip, no external assets. */
const thumbs: Record<string, string> = {
  broll_coast_04: "linear-gradient(90deg,#1d2733 0%,#2c3d4a 45%,#8cbfcb 160%)",
  titles_open: "linear-gradient(90deg,#202329 0%,#2a2536 60%,#b9a7ff 180%)",
  broll_studio_01: "linear-gradient(90deg,#242230 0%,#33303e 50%,#a38bef 170%)",
  interview_a: "linear-gradient(90deg,#252830 0%,#3a3f4c 55%,#7e828c 160%)",
  interview_b: "linear-gradient(90deg,#252830 0%,#3a3f4c 55%,#80c9a0 190%)",
  interview_c: "linear-gradient(90deg,#252830 0%,#3a3f4c 55%,#e7bc78 190%)",
};

type StepState = "done" | "active" | "pending";

interface StageConfig {
  statusLabel: string;
  statusClasses: string;
  showCaret: boolean;
  steps: StepState[];
  timelineSelected: boolean;
  playheadPct: number | null;
}

const stageConfigs: Record<MockStage, StageConfig> = {
  describe: {
    statusLabel: "DRAFT",
    statusClasses: "text-text-tertiary",
    showCaret: true,
    steps: [],
    timelineSelected: false,
    playheadPct: null,
  },
  interpret: {
    statusLabel: "PLANNING",
    statusClasses: "text-accent-primary",
    showCaret: false,
    steps: ["done", "pending", "pending", "pending", "pending"],
    timelineSelected: false,
    playheadPct: null,
  },
  act: {
    statusLabel: "WORKING",
    statusClasses: "text-accent-primary",
    showCaret: false,
    steps: ["done", "active", "pending", "pending", "pending"],
    timelineSelected: true,
    playheadPct: 34,
  },
  review: {
    statusLabel: "REVIEW",
    statusClasses: "text-accent-success",
    showCaret: false,
    steps: ["done", "done", "done", "done", "done"],
    timelineSelected: true,
    playheadPct: 34,
  },
};

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
      className={`flex min-w-0 flex-col overflow-hidden border transition-colors duration-200 ${
        selected
          ? "border-accent-primary/60 bg-accent-primary/10"
          : "border-border-default bg-surface-raised/60"
      }`}
      style={{ width }}
    >
      <span
        className="h-2.5 w-full shrink-0 border-b border-black/20"
        style={{
          background: thumbs[label] ?? "var(--color-surface-interactive)",
        }}
        aria-hidden="true"
      />
      <span className="truncate px-2 py-1 font-mono text-md text-text-secondary">
        {label}
      </span>
    </div>
  );
}

function LockGlyph() {
  return (
    <svg
      width="9"
      height="10"
      viewBox="0 0 9 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <rect x="1" y="4" width="7" height="5" rx="1" />
      <path d="M3 4V2.8a1.5 1.5 0 013 0V4" />
    </svg>
  );
}

function MuteGlyph() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d="M1.5 4h1.8L5.5 2v6L3.3 6H1.5z" fill="currentColor" stroke="none" />
      <path d="M7 3.5l2.5 3M9.5 3.5L7 6.5" />
    </svg>
  );
}

function StepIcon({ state }: { state: StepState }) {
  if (state === "done") {
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-text-primary/30 text-md leading-none text-text-primary/80">
        ✓
      </span>
    );
  }
  if (state === "active") {
    return (
      <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border border-accent-primary">
        <span className="pulse-dot h-1 w-1 rounded-full bg-accent-primary" />
      </span>
    );
  }
  return (
    <span className="h-3.5 w-3.5 shrink-0 rounded-full border border-border-default" />
  );
}

/**
 * Illustrative editor workspace driven by a narrative stage. Purely
 * presentational — never interactive, always labeled as illustrative by
 * its callers. `compact` drops the media pool so the preview keeps a
 * believable size inside narrower containers (e.g. the sticky showcase).
 */
export function WorkspaceMock({
  stage,
  compact = false,
}: {
  stage: MockStage;
  compact?: boolean;
}) {
  const config = stageConfigs[stage];

  return (
    <div
      role="img"
      aria-label={`Illustration of the Splic editing workspace (${stage} stage): a coastal video frame above a multi-track timeline, with the Splic agent panel showing the current instruction and step progress.`}
      className="overflow-hidden rounded-xl border border-border-subtle bg-surface-primary shadow-product"
    >
      {/* Window chrome */}
      <div className="flex items-center gap-3 border-b border-border-subtle bg-surface-raised px-4 py-2.5">
        <span className="flex gap-2" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-text-primary/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-text-primary/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-text-primary/20" />
        </span>
        <span className="truncate font-mono text-md text-text-tertiary">
          splic — coastal-recut
        </span>
        <span className="ml-auto hidden rounded-full border border-border-default px-2.5 py-1 text-md uppercase tracking-[0.18em] text-text-tertiary sm:block">
          Illustrative
        </span>
      </div>

      <div
        className={
          compact
            ? "grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_15rem]"
            : "grid grid-cols-1 lg:grid-cols-[11.5rem_minmax(0,1fr)_16rem]"
        }
      >
        {/* Media pool (full layout only) */}
        {compact ? null : (
          <div className="hidden border-r border-border-subtle bg-surface-raised lg:block">
            <div className="border-b border-border-subtle px-4 py-2.5 font-mono text-md uppercase tracking-[0.16em] text-text-tertiary">
              Media
            </div>
            <ul className="flex flex-col gap-1 p-3">
              {mediaItems.map((item, index) => (
                <li
                  key={item.name}
                  className={`flex items-center justify-between gap-2 px-2 py-1 ${
                    index === 2 ? "bg-surface-elevated" : ""
                  }`}
                >
                  <span className="truncate font-mono text-md text-text-secondary">
                    {item.name}
                  </span>
                  <span className="shrink-0 font-mono text-md text-text-tertiary">
                    {item.meta}
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-1 border-t border-border-subtle px-4 py-2.5 font-mono text-md text-text-tertiary">
              + Import
            </div>
          </div>
        )}

        {/* Preview */}
        <div className="min-w-0">
          <div className="relative aspect-video w-full overflow-hidden">
            {/* Coastal scene stand-in for the program monitor */}
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,#171b26_0%,#121620_46%,#0d1016_52%,#0a0c10_100%)]" />
            <div
              className="absolute left-[62%] top-[30%] h-8 w-8 rounded-full bg-text-primary/[0.07] blur-[2px]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 top-[52%] h-px bg-text-primary/12"
              aria-hidden="true"
            />
            <div
              className="absolute inset-x-0 top-[52%] bottom-0 bg-[linear-gradient(to_bottom,rgba(140,191,203,0.07),transparent_55%)]"
              aria-hidden="true"
            />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.5)_100%)]" />
            <div className="absolute inset-6 border border-text-primary/[0.07]" />
            <span className="absolute left-4 top-4 h-4 w-4 border-l border-t border-text-primary/20" />
            <span className="absolute right-4 top-4 h-4 w-4 border-r border-t border-text-primary/20" />
            <span className="absolute bottom-4 left-4 h-4 w-4 border-b border-l border-text-primary/20" />
            <span className="absolute bottom-4 right-4 h-4 w-4 border-b border-r border-text-primary/20" />
            <span className="absolute left-4 top-4 font-mono text-md tracking-[0.14em] text-text-primary/45">
              PROGRAM
            </span>
            <span className="absolute bottom-4 right-4 font-mono text-md text-text-primary/45">
              00:00:12:04
            </span>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-3 border-t border-border-subtle bg-surface-base px-3 py-2.5 sm:gap-4 sm:px-4">
            <span
              className="flex items-center gap-3 text-text-secondary"
              aria-hidden="true"
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <rect x="1" y="1" width="1.5" height="8" />
                <path d="M9 1v8L4 5z" />
              </svg>
              <svg width="11" height="12" viewBox="0 0 11 12" fill="currentColor">
                <path d="M1 1l9 5-9 5z" />
              </svg>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
                <path d="M1 1l5 4-5 4z" />
                <rect x="7.5" y="1" width="1.5" height="8" />
              </svg>
            </span>
            <span className="hidden items-center gap-3 font-mono text-md text-text-tertiary sm:flex">
              <span>00:00:12:04</span>
              <span>/</span>
              <span>00:01:48:12</span>
            </span>
            <span className="ml-auto flex items-center gap-2">
              <span className="border border-border-default px-2 py-1 font-mono text-md text-text-tertiary">
                FIT
              </span>
              <span className="border border-border-default px-2 py-1 font-mono text-md text-text-tertiary">
                1080P
              </span>
            </span>
          </div>
        </div>

        {/* Agent panel */}
        <div className="min-w-0 border-t border-border-subtle bg-surface-raised lg:border-l lg:border-t-0">
          <div className="flex items-center justify-between border-b border-border-subtle px-4 py-2.5">
            <span className="font-mono text-md uppercase tracking-[0.16em] text-text-tertiary">
              Splic agent
            </span>
            <span
              className={`flex items-center gap-2 font-mono text-md transition-colors duration-200 ${config.statusClasses}`}
            >
              <span
                className={`h-2 w-2 rounded-full bg-current ${stage === "act" ? "pulse-dot" : ""}`}
              />
              {config.statusLabel}
            </span>
          </div>

          <div className="p-3">
            <div className="border border-border-default bg-surface-primary px-3 py-2.5">
              <p className="font-mono text-md uppercase tracking-[0.16em] text-text-tertiary">
                Instruction
              </p>
              <p className="mt-2 text-md text-text-primary">
                {config.showCaret ? (
                  <>
                    Make the opening feel more cinematic…
                    <span className="caret" aria-hidden="true" />
                  </>
                ) : (
                  instructionText
                )}
              </p>
            </div>

            <ol className="mt-3 flex flex-col gap-1">
              {config.steps.map((state, index) => (
                <li
                  key={stepLabels[index]}
                  className={`flex items-center gap-2 px-2 py-1 text-md transition-colors duration-200 ${
                    state === "pending"
                      ? "text-text-tertiary"
                      : "text-text-secondary"
                  }`}
                >
                  <StepIcon state={state} />
                  <span className="truncate">{stepLabels[index]}</span>
                </li>
              ))}
            </ol>

            {stage === "review" ? (
              <div className="mt-3 border-t border-border-subtle pt-2.5">
                <p className="text-md font-medium text-text-primary">
                  Ready for your review
                </p>
                <div className="mt-2 inline-flex items-center rounded-sm border border-accent-primary/60 px-2.5 py-1 text-md font-medium text-accent-primary">
                  Review changes
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-x-auto border-t border-border-subtle bg-surface-raised">
        <div className="relative min-w-[34rem] px-4 pb-4 pt-3">
          <div className="flex font-mono text-md text-text-tertiary">
            {rulerMarks.map((mark) => (
              <span
                key={mark}
                className="flex-1 border-l border-border-subtle px-2 leading-none"
              >
                {mark}
              </span>
            ))}
          </div>

          <div className="relative mt-2.5 flex flex-col gap-2">
            {config.playheadPct !== null ? (
              <span
                data-playhead=""
                className="pointer-events-none absolute -top-1 bottom-0 z-10 w-px bg-accent-primary/70"
                style={{ left: `${config.playheadPct}%` }}
              >
                <span className="absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rotate-45 bg-accent-primary" />
              </span>
            ) : null}

            <div className="flex items-center gap-2">
              <span className="flex w-9 shrink-0 items-center gap-1.5 font-mono text-md text-text-tertiary">
                V2
                <span className="text-text-tertiary/60">
                  <LockGlyph />
                </span>
              </span>
              <div className="flex min-w-0 flex-1 gap-1">
                <Clip label="broll_coast_04" width="24%" />
                <Clip label="titles_open" width="16%" />
                <Clip label="broll_studio_01" width="20%" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex w-9 shrink-0 items-center gap-1.5 font-mono text-md text-text-tertiary">
                V1
                <span className="text-text-tertiary/60">
                  <LockGlyph />
                </span>
              </span>
              <div className="flex min-w-0 flex-1 gap-1">
                <Clip label="interview_a" width="34%" />
                <Clip
                  label="interview_b"
                  width="28%"
                  selected={config.timelineSelected}
                />
                <Clip label="interview_c" width="24%" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="flex w-9 shrink-0 items-center gap-1.5 font-mono text-md text-text-tertiary">
                A1
                <span className="text-text-tertiary/60">
                  <MuteGlyph />
                </span>
              </span>
              <div className="waveform h-5.5 min-w-0 flex-1 border border-border-default bg-surface-primary opacity-80" />
            </div>

            <div className="flex items-center gap-2">
              <span className="flex w-9 shrink-0 items-center gap-1.5 font-mono text-md text-text-tertiary">
                A2
                <span className="text-text-tertiary/60">
                  <MuteGlyph />
                </span>
              </span>
              <div className="flex min-w-0 flex-1 gap-1">
                <div className="waveform h-5.5 min-w-0 flex-1 border border-border-default bg-surface-primary opacity-50" />
                <div className="h-5.5 w-[18%] shrink-0 border border-border-default bg-surface-elevated" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Callout anchors are tuned against the mock's internal geometry so a
 * marker never sits on top of interface text at either preview width
 * (80% initial or 100% expanded). They are decorative, so they only
 * render at xl where that geometry is stable; narrower viewports get the
 * readable list below instead.
 */
const callouts = [
  {
    number: "1",
    label: "The agent prompt",
    className: "top-[28%] left-[66%]",
  },
  {
    number: "2",
    label: "The timeline change",
    className: "top-[80.5%] left-[90%]",
  },
  {
    number: "3",
    label: "Ready for your review",
    className: "top-[60%] left-[91%]",
  },
];

/**
 * Hero product demonstration: the review-stage workspace with numbered
 * callouts. Illustrative, never interactive.
 */
export function AgentDemo() {
  return (
    <figure className="w-full">
      <div className="relative">
        <div className="glass-frame relative overflow-hidden rounded-lg">
          <WorkspaceMock stage="review" />
          {/* Inset top highlight (Linear shadow.2). */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.06]"
          />
        </div>

        {/* Numbered callouts (desktop overlay) */}
        <div
          className="pointer-events-none absolute inset-0 hidden xl:block"
          aria-hidden="true"
        >
          {callouts.map((callout) => (
            <span
              key={callout.number}
              className={`absolute flex h-7 w-7 items-center justify-center rounded-full border border-border-default bg-surface-base/90 font-mono text-md text-text-primary ${callout.className}`}
            >
              {callout.number}
            </span>
          ))}
        </div>
      </div>

      {/* Callout list (narrow viewports; readable description of the
          callouts, shown wherever the overlay is not). */}
      <ol className="mt-5 flex flex-col gap-2 xl:hidden">
        {callouts.map((callout) => (
          <li
            key={callout.number}
            className="flex items-center gap-3 text-md text-text-secondary"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border-default font-mono text-text-primary">
              {callout.number}
            </span>
            {callout.label}
          </li>
        ))}
      </ol>

      <figcaption className="mt-4 text-md text-text-tertiary">
        Illustrative workspace Splic is in development and the interface
        shown is not a real screenshot.
      </figcaption>
    </figure>
  );
}
