/**
 * Install-to-export workflow used by the homepage workflow section and the
 * /how-it-works page.
 *
 * Steps must match the real app flow. Steps that depend on unverified product
 * behaviour (sign-in requirements, confirmation prompts) are omitted or keep
 * generic wording until confirmed.
 */

export interface WorkflowStep {
  id: string;
  number: string;
  title: string;
  /** One-sentence summary for the homepage tabs. */
  summary: string;
  /** Longer body for /how-it-works. */
  body: string;
  needsConfirmation: boolean;
  /** Show this step on /how-it-works. */
  onHowItWorks: boolean;
}

export const workflowSteps: WorkflowStep[] = [
  {
    id: "project",
    number: "01",
    title: "Open a project",
    summary: "Start a new project or open an existing one.",
    body: "Create a new project or open one you already have. Your projects live locally on your computer.",
    needsConfirmation: false,
    onHowItWorks: true,
  },
  {
    id: "describe",
    number: "02",
    title: "Describe the edit",
    summary: "Say what you want in plain language.",
    body: "Type what you want in plain language. For example: “Make the opening feel more cinematic. Slow down the first shot and bring the music in gently.”",
    needsConfirmation: false,
    onHowItWorks: true,
  },
  {
    id: "act",
    number: "03",
    title: "Splic acts",
    summary: "The agent performs supported editing actions.",
    body: "The agent plans the steps and performs supported editing actions inside your project, showing its work as it goes.",
    needsConfirmation: true,
    onHowItWorks: true,
  },
  {
    id: "review",
    number: "04",
    title: "Review and refine",
    summary: "Check the result and adjust the instruction.",
    body: "Review the result. If something isn't right, tell Splic what to change — or edit it yourself. You decide what stays.",
    needsConfirmation: true,
    onHowItWorks: true,
  },
  {
    id: "export",
    number: "05",
    title: "Export",
    summary: "Export your finished video.",
    body: "Export your finished video when you're happy with the cut.",
    needsConfirmation: true,
    onHowItWorks: true,
  },
];

export const howItWorksExpectation = {
  title: "What to expect",
  points: [
    "The agent performs supported actions — not every edit can be completed automatically.",
    "Some edits will need manual work.",
    "You can always review before exporting.",
  ],
  needsConfirmation: true,
};

export const exampleInstruction =
  "Make the opening feel more cinematic. Slow down the first shot and bring the music in gently.";

/**
 * Homepage product-showcase narrative (Screen Studio-style sticky
 * walkthrough). Maps the honest workflow onto four visual mock stages.
 * Copy must stay consistent with `workflowSteps` above.
 */
export type MockStage = "describe" | "interpret" | "act" | "review";

export interface ShowcaseStage {
  id: string;
  number: string;
  kicker: string;
  title: string;
  body: string;
  mockStage: MockStage;
}

export const showcaseStages: ShowcaseStage[] = [
  {
    id: "s-describe",
    number: "01",
    kicker: "Describe",
    title: "Say what you want",
    body: "Type the edit in plain language — tighten the opening, cut the dead air, caption the second section. No keyframes, no macros.",
    mockStage: "describe",
  },
  {
    id: "s-interpret",
    number: "02",
    kicker: "Interpret",
    title: "Splic plans the work",
    body: "The agent reads the timeline, breaks the instruction into supported editing actions, and shows its plan before touching a clip.",
    mockStage: "interpret",
  },
  {
    id: "s-act",
    number: "03",
    kicker: "Edit",
    title: "The workspace changes",
    body: "Supported changes happen inside your project — trims, pacing, captions — with the timeline updating as each step completes.",
    mockStage: "act",
  },
  {
    id: "s-review",
    number: "04",
    kicker: "Review",
    title: "You decide what stays",
    body: "Check the result. Refine the instruction or edit by hand. Nothing exports until you are happy with the cut.",
    mockStage: "review",
  },
];
