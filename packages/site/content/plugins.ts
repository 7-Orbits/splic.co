/**
 * Plugin catalogue.
 *
 * No plugin has shipped. The three entries below are planned workflows, not
 * products: they carry no capabilities, screenshots or prices. When real
 * plugins ship, add entries with `verified: true`, optional
 * `capabilitiesVerified`, slugs, prices and status, and the catalogue and
 * homepage sections switch automatically.
 */

export type PluginStatus =
  | "free"
  | "included"
  | "premium"
  | "planned"
  | "unavailable";

export interface Plugin {
  slug: string;
  name: string;
  /** One-line description of the intended audience. */
  audience: string;
  /** One-line description of the problem the plugin aims to solve. */
  problem: string;
  /** Short summary used on cards and detail headers. */
  summary: string;
  status: PluginStatus;
  verified: boolean;
  capabilitiesVerified: boolean;
  /** Preview image path. Absent while planned. */
  previewSrc?: string;
  previewAlt?: string;
  /** Example plain-language instruction, only when verified. */
  examplePrompt?: string;
  exampleOutcome?: string;
  /** Required Splic version and OS support, only when verified. */
  compatibility?: string[];
  /** Monthly price in USD for premium plugins, only when verified. */
  priceMonthly?: number;
  /** Related plugin slugs. */
  related: string[];
}

export const plugins: Plugin[] = [
  {
    slug: "gaming",
    name: "Gaming videos",
    audience: "Streamers and gaming creators",
    problem:
      "Turn hours of raw footage into a tight highlight reel without scrubbing every kill and clutch moment.",
    summary:
      "A planned workflow for cutting gaming highlights into paced, watchable videos.",
    status: "planned",
    verified: false,
    capabilitiesVerified: false,
    related: ["podcast", "cinematic"],
  },
  {
    slug: "podcast",
    name: "Podcast editing",
    audience: "Podcasters and interview creators",
    problem:
      "Remove dead air, balance speakers and cut filler without listening through every episode twice.",
    summary:
      "A planned workflow for editing long-form conversation into clean episodes.",
    status: "planned",
    verified: false,
    capabilitiesVerified: false,
    related: ["gaming", "cinematic"],
  },
  {
    slug: "cinematic",
    name: "Cinematic editing",
    audience: "Filmmakers and short-form storytellers",
    problem:
      "Shape pacing, colour and sound across a sequence without repeating the same pass on every shot.",
    summary:
      "A planned workflow for shaping mood and pacing across cinematic sequences.",
    status: "planned",
    verified: false,
    capabilitiesVerified: false,
    related: ["gaming", "podcast"],
  },
];

export const verifiedPlugins = plugins.filter((plugin) => plugin.verified);

export const hasVerifiedPlugins = verifiedPlugins.length > 0;

export function getPlugin(slug: string): Plugin | undefined {
  return plugins.find((plugin) => plugin.slug === slug);
}

export const pluginStatusLabels: Record<PluginStatus, string> = {
  free: "Free",
  included: "Included with a plan",
  premium: "Premium",
  planned: "Planned",
  unavailable: "Currently unavailable",
};
