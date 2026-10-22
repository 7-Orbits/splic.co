const toolCalls = [
  { call: "plan_edits(goal)", state: "done" as const },
  { call: "trim_clip(interview_a · 00:04–00:11)", state: "done" as const },
  { call: "move_clip(broll_coast_04 → 00:00)", state: "done" as const },
  { call: "add_captions(section = 2)", state: "active" as const },
];

const checks = [
  { label: "Silences removed", meta: "4 of 4", state: "ok" as const },
  { label: "Opening length", meta: "11.8s", state: "ok" as const },
  {
    label: "Caption overlap · section 2",
    meta: "corrected",
    state: "fixed" as const,
  },
];

export function DescribeVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of the describe step: a plain-language instruction being written for Splic."
      className="overflow-hidden border border-line-strong bg-surface-strong"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface-strong px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
          Instruction
        </span>
        <span className="font-mono text-xs tracking-[0.14em] text-text-tertiary">
          DRAFT
        </span>
      </div>
      <div className="p-4 sm:p-6">
        <p className="text-lg text-text-primary">
          Tighten the intro to twelve seconds, remove the silences, and add
          captions to the second section.
          <span
            className="caret ml-0.5 inline-block h-[1.05em] w-px translate-y-[0.18em] bg-surface-raised/70"
            aria-hidden="true"
          />
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-3.5">
          <span className="font-mono text-xs tracking-[0.14em] text-text-tertiary">
            PLAIN LANGUAGE
          </span>
          <span className="border border-line-strong bg-surface-base px-2.5 py-1 font-mono text-xs text-text-secondary">
            ↵ describe
          </span>
        </div>
      </div>
    </div>
  );
}

export function ExecuteVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of the execute step: the agent runs supported editing actions, listed as tool calls above a changing timeline."
      className="overflow-hidden border border-line-strong bg-surface-strong"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface-strong px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
          Agent actions
        </span>
        <span className="flex items-center gap-2 font-mono text-xs tracking-[0.14em] text-text-secondary">
          <span className="pulse-dot h-2 w-2 rounded-full bg-surface-raised/80" />
          RUNNING
        </span>
      </div>

      <ul className="flex flex-col gap-1 p-3">
        {toolCalls.map((item) => (
          <li
            key={item.call}
            className={`flex items-center gap-2 px-2 py-1 font-mono text-sm ${
              item.state === "active"
                ? "bg-surface-raised/[0.05] text-text-primary"
                : "text-text-secondary"
            }`}
          >
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-xs leading-none ${
                item.state === "done"
                  ? "border-text-primary/30 text-text-primary/80"
                  : "border-text-primary/50"
              }`}
            >
              {item.state === "done" ? (
                "✓"
              ) : (
                <span className="pulse-dot h-1 w-1 rounded-full bg-surface-raised" />
              )}
            </span>
            <span className="truncate">{item.call}</span>
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-2 border-t border-line bg-surface-muted px-3 pb-3 pt-2.5">
        <div className="flex items-center gap-2">
          <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
            V1
          </span>
          <div className="flex min-w-0 flex-1 gap-1">
            <div className="flex h-5.5 items-center border border-line-strong bg-surface-raised/[0.05] px-2">
              <span className="truncate font-mono text-xs text-text-secondary">
                intro_new
              </span>
            </div>
            <div className="flex h-5.5 items-center border border-text-primary/30 bg-surface-raised/10 px-2">
              <span className="truncate font-mono text-xs text-text-secondary">
                interview_a
              </span>
            </div>
            <div className="h-5.5 w-[22%] border border-line-strong bg-surface-raised/[0.05]" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-7 shrink-0 font-mono text-xs text-text-tertiary">
            A1
          </span>
          <div className="waveform h-5.5 min-w-0 flex-1 border border-line-strong bg-surface-base opacity-70" />
        </div>
      </div>
    </div>
  );
}

export function VerifyVisual() {
  return (
    <div
      role="img"
      aria-label="Illustration of the verify step: a checklist where the agent reports the result, finds a caption overlap, and corrects it."
      className="overflow-hidden border border-line-strong bg-surface-strong"
    >
      <div className="flex items-center justify-between border-b border-line bg-surface-strong px-4 py-2.5">
        <span className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
          Inspection
        </span>
        <span className="font-mono text-xs tracking-[0.14em] text-text-tertiary">
          PASS 2
        </span>
      </div>

      <ul className="flex flex-col gap-1 p-3">
        {checks.map((item) => (
          <li
            key={item.label}
            className="flex items-center gap-2 px-2 py-1 text-md text-text-secondary"
          >
            <span
              className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full border text-xs leading-none ${
                item.state === "ok"
                  ? "border-text-primary/30 text-text-primary/80"
                  : "border-text-primary/50 text-text-primary"
              }`}
            >
              {item.state === "ok" ? "✓" : "↺"}
            </span>
            <span className="min-w-0 flex-1 truncate">{item.label}</span>
            <span className="shrink-0 font-mono text-xs text-text-tertiary">
              {item.meta}
            </span>
          </li>
        ))}
      </ul>

      <div className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <span className="text-sm text-text-secondary">
          One issue found and corrected.
        </span>
        <span className="border border-line-strong bg-surface-base px-2.5 py-1 font-mono text-xs text-text-secondary">
          Review result
        </span>
      </div>
    </div>
  );
}
