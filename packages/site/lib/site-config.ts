export interface SiteLinks {
  /** Real download URL when a release exists. */
  download: string | null;
  /** Optional early-access / waitlist destination. */
  waitlist: string | null;
  /** Optional documentation destination. */
  docs: string | null;
  /** Optional contact destination (mailto:). */
  contact: string | null;
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

export const siteConfig = {
  name: "Splic",
  handle: "splic.co",
  attribution: "A product by 7.Orbits",
  links: {
    download,
    waitlist,
    docs,
    contact: contactEmail ? `mailto:${contactEmail}` : null,
    repository: "https://github.com/7-Orbits/splic.co",
    organization: "https://github.com/7-Orbits",
  } satisfies SiteLinks,
} as const;

/**
 * Primary calls to action point at the configured download when one exists.
 * Otherwise they scroll to the honest in-page download state.
 */
export const downloadHref = download ?? "#download";

/** True when no real download or waitlist destination is configured. */
export const downloadPending = !download && !waitlist;

/** Destination for the final call to action. */
export const startHref = download ?? waitlist ?? "#download";
