/**
 * Feature sections for /features and the homepage value/workflow content.
 *
 * Every feature carries a status. `planned` features are labeled in the UI;
 * features whose claims depend on unverified product behaviour keep
 * `needsConfirmation: true` and generic wording.
 */

export type FeatureStatus = "available" | "planned";

export interface Feature {
  id: string;
  status: FeatureStatus;
  needsConfirmation: boolean;
  title: string;
  subtitle: string;
  benefit: string;
  detail: string;
}

export const features: Feature[] = [
  {
    id: "natural-language-editing",
    status: "planned",
    needsConfirmation: false,
    title: "Natural-language editing",
    subtitle: "Describe the edit. Splic handles the steps.",
    benefit: "Skip hunting for the right tool and panel.",
    detail:
      "Type what you want in plain language — a tighter opening, fewer silences, a slower first shot — and Splic works through the steps inside your project.",
  },
  {
    id: "agent-driven-actions",
    status: "planned",
    needsConfirmation: true,
    title: "Agent-driven actions",
    subtitle: "Real editing actions, not suggestions.",
    benefit: "The agent changes the project; you review the change.",
    detail:
      "The agent performs supported editing actions directly on your timeline, shows the steps it takes, and hands the result back for your review before anything is final.",
  },
  {
    id: "timeline-and-media",
    status: "planned",
    needsConfirmation: true,
    title: "Timeline and media workflow",
    subtitle: "A full editor under the agent.",
    benefit: "Take over by hand at any moment.",
    detail:
      "Splic is a real editor first: multi-track timeline, media pool, preview and export. The agent works inside that editor, not around it.",
  },
  {
    id: "preview-and-refine",
    status: "planned",
    needsConfirmation: true,
    title: "Preview and refine",
    subtitle: "Review every change.",
    benefit: "You stay in control of the final cut.",
    detail:
      "Every agent change is presented for review. Keep it, adjust the instruction, or edit the result yourself.",
  },
  {
    id: "local-projects",
    status: "planned",
    needsConfirmation: true,
    title: "Local projects",
    subtitle: "Your projects stay on your computer.",
    benefit: "Work locally, without uploading your footage to edit.",
    detail:
      "Projects live in a local folder on your machine. Local editing does not require cloud storage.",
  },
  {
    id: "plugin-capabilities",
    status: "planned",
    needsConfirmation: true,
    title: "Plugin capabilities",
    subtitle: "Specialized workflows.",
    benefit: "Spend less time specifying every detail.",
    detail:
      "Plugins bring specialized editing workflows for specific kinds of video, such as gaming highlights or podcast episodes.",
  },
  {
    id: "optional-cloud-storage",
    status: "planned",
    needsConfirmation: true,
    title: "Optional cloud storage",
    subtitle: "Extra capacity when you want it.",
    benefit: "Add room for projects, footage and exports when you need it.",
    detail:
      "Cloud storage is a separate, optional product. Local editing never requires it.",
  },
];

export const featureLimits = {
  title: "What Splic does not promise",
  points: [
    "Not every edit can be completed automatically.",
    "You can always review, undo and edit manually.",
  ],
  needsConfirmation: true,
};
