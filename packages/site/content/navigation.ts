import type { ReleaseStage } from "@/content/release";

export interface NavItem {
  label: string;
  href: string;
}

/**
 * Header navigation. All items are real routes; the redesign ships no
 * placeholder or anchor-only nav links. Contact is a real /contact route.
 */
export const primaryNav: NavItem[] = [
  { label: "Features", href: "/features" },
  { label: "Plugins", href: "/plugins" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
];

export interface FooterColumn {
  title: string;
  links: NavItem[];
}

/**
 * Footer columns. The Resources column is omitted until documentation,
 * support or changelog pages exist. Privacy and Terms are omitted until
 * those pages exist.
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
  ];
}

/** Primary call-to-action label driven by release stage. */
export function primaryCtaLabel(stage: ReleaseStage): string {
  return stage === "live" ? "Download Splic" : "Get early access";
}

/** Primary call-to-action destination. Always the real /download route. */
export const primaryCtaHref = "/download";
