import { Wordmark } from "./wordmark";
import { siteConfig } from "@/lib/site-config";

const productLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Download", href: "#download" },
];

const resourceLinks = [
  ...(siteConfig.links.docs
    ? [{ label: "Documentation", href: siteConfig.links.docs, external: true }]
    : []),
  { label: "FAQ", href: "#faq", external: false },
  {
    label: "GitHub",
    href: siteConfig.links.repository,
    external: true,
  },
];

const companyLinks = [
  {
    label: "About 7.Orbits",
    href: siteConfig.links.organization,
    external: true,
  },
  ...(siteConfig.links.contact
    ? [{ label: "Contact", href: siteConfig.links.contact, external: false }]
    : []),
];

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string; external?: boolean }[];
}) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) => (
          <li key={link.label}>
            <a
              href={link.href}
              className="text-lg text-text-secondary transition-colors hover:text-text-primary"
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface-muted">
      <div className="container-page py-14">
        <div className="grid gap-14 sm:grid-cols-2 md:grid-cols-[1.5fr_repeat(3,minmax(0,1fr))] md:gap-8 lg:gap-14">
          <div className="sm:col-span-2 md:col-span-1">
            <a href="#top" aria-label="Splic — back to top">
              <Wordmark withHandle markSize={20} />
            </a>
            <p className="mt-4 text-lg text-text-secondary">
              <a
                href={siteConfig.links.organization}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-text-primary"
              >
                {siteConfig.attribution}
              </a>
            </p>
            <p className="mt-2 max-w-xs text-md text-text-tertiary">
              An AI-assisted desktop video editor, in development.
            </p>
          </div>

          <FooterColumn title="Product" links={productLinks} />
          <FooterColumn title="Resources" links={resourceLinks} />
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-text-tertiary">
            © 2026 Splic.co · A product by 7.Orbits
          </p>
          <p className="flex items-center gap-5 text-xs text-text-tertiary">
            <span title="Coming soon">Privacy</span>
            <span title="Coming soon">Terms</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
