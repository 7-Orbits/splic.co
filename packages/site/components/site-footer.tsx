import Link from "next/link";
import { AmbientGlow } from "./ui/ambient-glow";
import { Wordmark } from "./wordmark";
import { siteConfig } from "@/lib/site-config";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

interface FooterColumnData {
  title: string;
  links: FooterLink[];
}

function FooterColumn({ title, links }: FooterColumnData) {
  if (links.length === 0) return null;

  return (
    <div>
      <h3 className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
        {title}
      </h3>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-text-secondary transition-colors hover:text-text-primary inline-flex items-center gap-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary rounded-xs"
              >
                <span>{link.label}</span>
                <span aria-hidden="true" className="text-text-tertiary text-xs">
                  ↗
                </span>
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary rounded-xs"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const consoleDestination = siteConfig.links.console ?? "/console";
  const isExternalConsole = !consoleDestination.startsWith("/");

  // Product column
  const productLinks: FooterLink[] = [
    { label: "Features", href: "/features" },
    { label: "Plugins", href: "/plugins" },
    { label: "Pricing", href: "/pricing" },
    { label: "Download", href: "/download" },
    { label: "How it works", href: "/how-it-works" },
  ];

  // Account column
  const accountLinks: FooterLink[] = [
    {
      label: "Console",
      href: consoleDestination,
      external: isExternalConsole,
    },
    { label: "Plans & billing", href: "/console/billing" },
  ];

  // Company column
  const companyLinks: FooterLink[] = [
    { label: "Contact", href: "/contact" },
    {
      label: "Email",
      href: "mailto:contact@splic.co",
      external: true,
    },
  ];

  // Resources column
  const resourceLinks: FooterLink[] = [
    ...(siteConfig.links.docs
      ? [{ label: "Documentation", href: siteConfig.links.docs, external: true }]
      : []),
    { label: "FAQ", href: "/#faq" },
    {
      label: "GitHub",
      href: siteConfig.links.repository,
      external: true,
    },
  ];

  // Connect column (empty unless configured, avoiding dead/fake links)
  const connectLinks: FooterLink[] = [];

  const columns: FooterColumnData[] = [
    { title: "Product", links: productLinks },
    { title: "Account", links: accountLinks },
    { title: "Company", links: companyLinks },
    { title: "Resources", links: resourceLinks },
    ...(connectLinks.length > 0
      ? [{ title: "Connect", links: connectLinks }]
      : []),
  ];

  const legalLinks: FooterLink[] = [
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
    { label: "Refund & Cancellation Policy", href: "/refunds" },
    { label: "Cookie Policy", href: "/cookies" },
  ];

  return (
    <footer className="glass-footer relative isolate overflow-clip">
      <AmbientGlow variant="bottom-corners" opacity={0.4} />

      <div className="container-page relative pt-12 pb-14 md:pt-16 md:pb-16 lg:pt-20 lg:pb-20">
        {/* Main 5-column / responsive grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-12 lg:gap-8">
          {/* Brand info block */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-4 flex flex-col">
            <Link
              href="/"
              aria-label="Splic — home"
              className="inline-flex items-center transition-opacity hover:opacity-80"
            >
              <Wordmark withHandle markSize={20} />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-text-secondary leading-relaxed">
              {siteConfig.tagline} Transparent local execution with intelligent
              timeline automation.
            </p>
            <p className="mt-4 text-xs text-text-tertiary">
              <a
                href={siteConfig.links.organization}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary rounded-xs"
              >
                {siteConfig.attribution} ↗
              </a>
            </p>
          </div>

          {/* Links navigation columns */}
          <div className="sm:col-span-2 md:col-span-6 lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {columns.map((column) => (
              <FooterColumn
                key={column.title}
                title={column.title}
                links={column.links}
              />
            ))}
          </div>
        </div>

        {/* Legal links row */}
        <div className="mt-14 pt-8 border-t border-border-subtle flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <ul className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <Link
                  href={link.href}
                  className="text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary rounded-xs"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className="text-xs text-text-tertiary">
            © 2026 Splic.co — {siteConfig.attribution}
          </p>
        </div>
      </div>
    </footer>
  );
}
