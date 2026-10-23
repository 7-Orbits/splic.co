import Link from "next/link";
import { AmbientGlow } from "./ui/ambient-glow";
import { Wordmark } from "./wordmark";
import { footerColumns } from "@/content/navigation";
import { siteConfig } from "@/lib/site-config";

interface FooterLink {
  label: string;
  href: string;
  external?: boolean;
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: FooterLink[];
}) {
  return (
    <div>
      <h2 className="eyebrow">{title}</h2>
      <ul className="mt-4 flex flex-col gap-2.5">
        {links.map((link) =>
          link.external ? (
            <li key={link.label}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-md text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </a>
            </li>
          ) : (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-md text-text-secondary transition-colors hover:text-text-primary"
              >
                {link.label}
              </Link>
            </li>
          ),
        )}
      </ul>
    </div>
  );
}

export function SiteFooter() {
  const columns = footerColumns();
  const companyLinks: FooterLink[] = [
    { label: "Contact", href: "/contact" },
    {
      label: "7.Orbits",
      href: siteConfig.links.organization,
      external: true,
    },
  ];

  return (
    <footer className="relative isolate overflow-clip">
      <AmbientGlow variant="bottom-corners" opacity={0.5} />
      <div className="container-page relative pt-8 pb-14 md:pt-12 lg:pt-16">
        <div className="grid gap-12 sm:grid-cols-2 md:grid-cols-[1.6fr_repeat(2,minmax(0,1fr))] md:gap-8 lg:gap-14">
          <div className="sm:col-span-2 md:col-span-1">
            <Link href="/" aria-label="Splic — home">
              <Wordmark withHandle markSize={20} />
            </Link>
            <p className="mt-4 max-w-xs text-md text-text-secondary">
              {siteConfig.tagline}
            </p>
            <p className="mt-4 text-md text-text-tertiary">
              <a
                href={siteConfig.links.organization}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors hover:text-text-primary"
              >
                {siteConfig.attribution}
              </a>
            </p>
          </div>

          {columns.map((column) => (
            <FooterColumn
              key={column.title}
              title={column.title}
              links={column.links}
            />
          ))}
          <FooterColumn title="Company" links={companyLinks} />
        </div>

        <div className="mt-14 border-t border-border-subtle pt-8">
          <p className="text-md text-text-tertiary">
            © 2026 Splic.co · Splic.co — {siteConfig.attribution}
          </p>
        </div>
      </div>
    </footer>
  );
}
