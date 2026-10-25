import type { ReleaseStage } from "@/content/release";

export interface NavItem {
  label: string;
  href: string;
}

export interface MegaMenuItem {
  label: string;
  description: string;
  href: string;
  iconName: "Film" | "Bot" | "Puzzle" | "Sliders" | "Workflow" | "Download";
}

export interface MegaMenuSection {
  title: string;
  items: MegaMenuItem[];
}

/**
 * Product mega-menu columns inspired by Linear's dropdown.
 * Routes point to existing features, plugins, how-it-works, and download pages.
 */
export const productMegaMenuSections: MegaMenuSection[] = [
  {
    title: "Create",
    items: [
      {
        label: "Video editing",
        description: "Precision timeline and multi-track cuts",
        href: "/features",
        iconName: "Film",
      },
      {
        label: "Editing agent",
        description: "Natural language instructions to cut",
        href: "/features",
        iconName: "Bot",
      },
    ],
  },
  {
    title: "Customize",
    items: [
      {
        label: "Plugins",
        description: "Local and cloud workflow extensions",
        href: "/plugins",
        iconName: "Puzzle",
      },
      {
        label: "Review & refine",
        description: "Inspect diffs and approve sequence changes",
        href: "/how-it-works",
        iconName: "Sliders",
      },
    ],
  },
  {
    title: "Explore",
    items: [
      {
        label: "How it works",
        description: "From footage to finished timeline",
        href: "/how-it-works",
        iconName: "Workflow",
      },
      {
        label: "Download Splic",
        description: "Desktop app for macOS, Windows, Linux",
        href: "/download",
        iconName: "Download",
      },
    ],
  },
];

export const productBottomStrip = {
  text: "You bring the vision. Splic does the editing.",
  linkText: "Explore Splic",
  href: "/how-it-works",
};

/**
 * Header navigation. All items are real routes; the redesign ships no
 * placeholder or anchor-only nav links. Contact is a real /contact route.
 */
export const primaryNav: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Plugins", href: "/plugins" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
];

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

/**
 * Structured footer navigation columns matching Linear's information-rich structure.
 */
export function footerColumns(): FooterColumn[] {
  return [
    {
      title: "Product",
      links: [
        { label: "Features", href: "/features" },
        { label: "Plugins", href: "/plugins" },
        { label: "Pricing", href: "/pricing" },
        { label: "Download", href: "/download" },
        { label: "How it works", href: "/how-it-works" },
      ],
    },
    {
      title: "Account",
      links: [
        { label: "Console", href: "/console" },
        { label: "Plans & billing", href: "/console/billing" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "Contact", href: "/contact" },
        { label: "Email", href: "mailto:contact@splic.co" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "FAQ", href: "/#faq" },
        { label: "7-orbits", href: "https://7-orbits.com" },
      ],
    },
  ];
}

/** Primary call-to-action label driven by release stage. */
export function primaryCtaLabel(stage: ReleaseStage): string {
  return stage === "live" ? "Download Splic" : "Get early access";
}

/** Primary call-to-action destination. Always the real /download route. */
export const primaryCtaHref = "/download";

/**
 * Early-access / waitlist destination used by every CTA labelled for
 * early access (e.g. "Get early access"). The /download route stays reserved
 * for real downloads while the product is awaiting launch.
 */
export const earlyAccessHref = "/early-access";
