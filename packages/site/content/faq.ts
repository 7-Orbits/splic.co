/**
 * FAQ content shared by the homepage accordion and the pricing page.
 *
 * Entries marked `needsConfirmation: true` depend on product facts that are
 * not yet verified. They must be reconfirmed against the product before
 * `needsConfirmation` flips to false. Questions that depend on routes or
 * backends that do not exist are omitted entirely rather than answered.
 */

export interface FaqEntry {
  id: string;
  question: string;
  answer: string;
  needsConfirmation: boolean;
  /** Include on the pricing page in addition to the homepage. */
  onPricing: boolean;
}

export const faqs: FaqEntry[] = [
  {
    id: "what-is-splic",
    question: "What is Splic?",
    answer:
      "Splic is a desktop video editor with an AI agent. You describe an edit in plain language and the agent performs supported editing actions in your workspace.",
    needsConfirmation: false,
    onPricing: false,
  },
  {
    id: "how-agent-works",
    question: "How does the AI editing agent work?",
    answer:
      "The agent reads your project, plans the steps, and uses the editor's supported tools to make changes. It then checks the result where it can and presents it for your review. You can refine your instruction or adjust the edit manually.",
    needsConfirmation: true,
    onPricing: false,
  },
  {
    id: "editing-experience",
    question: "Do I need editing experience?",
    answer:
      "No. You can describe what you want in plain language. Basic familiarity with video editing helps you review and refine the result.",
    needsConfirmation: false,
    onPricing: false,
  },
  {
    id: "cloud-storage-required",
    question: "Do I need cloud storage?",
    answer:
      "No. Local editing does not require cloud storage. Cloud storage is optional for extra capacity or cloud-based features included in your plan.",
    needsConfirmation: true,
    onPricing: true,
  },
  {
    id: "what-are-plugins",
    question: "What are plugins?",
    answer:
      "Plugins add specialized editing workflows for specific kinds of video, such as gaming or podcasts.",
    needsConfirmation: true,
    onPricing: true,
  },
  {
    id: "how-to-install",
    question: "How do I install Splic?",
    answer:
      "Splic is not publicly downloadable yet. Join early access and we will tell you when it is.",
    needsConfirmation: false,
    onPricing: false,
  },
  {
    id: "supported-os",
    question: "Which operating systems are supported?",
    answer:
      "Splic is planned for macOS, Windows and Linux. Verified platform support will be listed on the Download page at launch.",
    needsConfirmation: true,
    onPricing: false,
  },
  {
    id: "free-vs-paid",
    question: "How does the free plan differ from paid plans?",
    answer:
      "Free includes the full manual editor and free plugins. Paid plans add agent usage, plugin access and cloud storage allowances. See Pricing for the full comparison.",
    needsConfirmation: true,
    onPricing: true,
  },
  {
    id: "manual-editing",
    question: "Can I still edit manually?",
    answer:
      "Yes. The full manual editor is included on every plan.",
    needsConfirmation: true,
    onPricing: false,
  },
];
