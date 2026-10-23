/**
 * Release configuration drives every download-related claim on the site.
 *
 * In the `early-access` stage no platform may report `status: "available"`,
 * and no installer URL may be set. The site renders the early-access state
 * instead of download buttons. Flip `releaseStage` to `"live"` and populate
 * real release data to switch the site into download mode — no redesign.
 */

export type ReleaseStage = "early-access" | "live";

export type PlatformStatus = "available" | "coming-soon" | "unsupported";

export type PlatformId = "macos" | "windows" | "linux";

export interface PlatformRelease {
  id: PlatformId;
  name: string;
  status: PlatformStatus;
  /** Semantic version of the latest release, or null when none exists. */
  version: string | null;
  /** ISO date of the latest release, or null when none exists. */
  releaseDate: string | null;
  arch: string[];
  formats: string[];
  /** Direct download URL. Required when status is "available". */
  url: string | null;
  minOS: string | null;
  requirements: string[];
  checksum: { algorithm: string; value: string } | null;
  signatureNote: string | null;
}

export const releaseStage: ReleaseStage = "early-access";

export const siteDomain = "https://splic.co";

export const platforms: PlatformRelease[] = [
  {
    id: "macos",
    name: "macOS",
    status: "coming-soon",
    version: null,
    releaseDate: null,
    arch: [],
    formats: [],
    url: null,
    minOS: null,
    requirements: [],
    checksum: null,
    signatureNote: null,
  },
  {
    id: "windows",
    name: "Windows",
    status: "coming-soon",
    version: null,
    releaseDate: null,
    arch: [],
    formats: [],
    url: null,
    minOS: null,
    requirements: [],
    checksum: null,
    signatureNote: null,
  },
  {
    id: "linux",
    name: "Linux",
    status: "coming-soon",
    version: null,
    releaseDate: null,
    arch: [],
    formats: [],
    url: null,
    minOS: null,
    requirements: [],
    checksum: null,
    signatureNote: null,
  },
];

/** Platforms with a verified public release. Empty while pre-launch. */
export const availablePlatforms = platforms.filter(
  (platform) => platform.status === "available",
);

export const isEarlyAccess = releaseStage === "early-access";

/** Hero/footer metadata line describing platform availability. */
export const platformMetadataLine = isEarlyAccess
  ? "Desktop app · Currently in development"
  : availablePlatforms.map((platform) => platform.name).join(" · ");
