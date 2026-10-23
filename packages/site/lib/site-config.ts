import { primaryCtaHref, primaryCtaLabel } from "@/content/navigation";
import { isEarlyAccess, releaseStage } from "@/content/release";

export interface SiteLinks {
  /** Real download URL when a release exists. */
  download: string | null;
  /** Optional early-access / waitlist destination. */
  waitlist: string | null;
  /** Optional documentation destination. */
  docs: string | null;
  /** Optional contact destination (mailto:). */
  contact: string | null;
  /**
   * Console destination. The in-repo Console preview lives at `/console`;
   * `NEXT_PUBLIC_CONSOLE_URL` can override it when a hosted Console app
   * replaces the preview.
   */
  console: string | null;
  /** Repository of this website and product identity. */
  repository: string;
  /** 7.Orbits organisation. */
  organization: string;
}

function readEnv(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

const download = readEnv(process.env.NEXT_PUBLIC_DOWNLOAD_URL);
const waitlist = readEnv(process.env.NEXT_PUBLIC_WAITLIST_URL);
const docs = readEnv(process.env.NEXT_PUBLIC_DOCS_URL);
const contactEmail = readEnv(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

/**
 * Console destination. Defaults to the in-repo preview at `/console`;
 * `NEXT_PUBLIC_CONSOLE_URL` overrides it for a hosted Console.
 */
const consoleUrl = readEnv(process.env.NEXT_PUBLIC_CONSOLE_URL) ?? "/console";

export const siteConfig = {
  name: "Splic",
  handle: "splic.co",
  tagline: "You bring the vision. Splic does the editing.",
  attribution: "A product by 7.Orbits",
  releaseStage,
  links: {
    download,
    waitlist,
    docs,
    contact: contactEmail ? `mailto:${contactEmail}` : null,
    console: consoleUrl,
    repository: "https://github.com/7-Orbits/splic.co",
    organization: "https://github.com/7-Orbits",
  } satisfies SiteLinks,
} as const;

/**
 * Primary calls to action always point at the real /download route, which
 * renders the honest early-access or installer state from release config.
 */
export const downloadHref = primaryCtaHref;

/** Site-wide primary CTA label, driven by release stage. */
export const ctaLabel = primaryCtaLabel(releaseStage);

/** True when no real download or waitlist destination is configured. */
export const downloadPending = !download && !waitlist;

/** Destination for the final call to action. */
export const startHref = primaryCtaHref;

/** Waitlist destination for early-access prompts, when configured. */
export const waitlistHref = waitlist;

/** Contact destination for sales enquiries, when configured. */
export const contactHref = contactEmail ? `mailto:${contactEmail}` : null;

export { isEarlyAccess, releaseStage };
