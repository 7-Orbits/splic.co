"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "./wordmark";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { Button } from "@/components/ui/button";
import { primaryCtaHref } from "@/content/navigation";
import { siteConfig } from "@/lib/site-config";

const navItems = [
  { label: "Features", href: "/features" },
  { label: "Plugins", href: "/plugins" },
  { label: "Pricing", href: "/pricing" },
  { label: "How it works", href: "/how-it-works" },
  { label: "Contact", href: "/contact" },
] as const;

/** Navbar pill label (Linear "Sign up" slot). Routes to the real
 * /download page, which renders the honest release-stage state. */
const ctaLabel = "Download";
const consoleHref = siteConfig.links.console;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Console action: the in-repo preview, or an env-configured hosted Console. */
function ConsoleAction({ className = "" }: { className?: string }) {
  const classes = `inline-flex items-center text-md leading-none text-text-secondary transition-colors duration-150 hover:text-text-primary ${className}`;

  if (consoleHref?.startsWith("/")) {
    return (
      <Link href={consoleHref} className={classes}>
        Console
      </Link>
    );
  }

  return (
    <a href={consoleHref ?? undefined} className={classes}>
      Console
    </a>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!open) return;

    stop();

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => {
      const root = dialogRef.current;
      if (!root) return [] as HTMLElement[];
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    function rootContains(node: EventTarget | null): boolean {
      return dialogRef.current?.contains(node as Node) ?? false;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !rootContains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !rootContains(active))) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const raf = requestAnimationFrame(() => {
      focusables()[0]?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
      document.body.style.overflow = previouslyFocused ? previousOverflow : "";
      start();
      previouslyFocused?.focus();
    };
  }, [open, start, stop]);

  return (
    <header className="site-nav">
      <div className="site-nav-rail">
        <div className="site-nav-stack">
          <div
            data-nav-intro=""
            className="glass-nav nav-bar flex items-center gap-6 px-4 lg:gap-8"
          >
            <Link
              href="/"
              aria-label="Splic — home"
              className="shrink-0 transition-opacity hover:opacity-80"
            >
              <Wordmark />
            </Link>

            <nav aria-label="Primary" className="hidden nav:block">
              <ul className="flex items-center gap-6">
                {navItems.map((item) => {
                  const active = isActive(pathname, item.href);
                  return (
                    <li key={item.href}>
                      <Link
                        className="nav-link py-2"
                        href={item.href}
                        data-active={active}
                        aria-current={active ? "page" : undefined}
                      >
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            <div className="ml-auto flex items-center gap-4 lg:gap-5">
              <span className="hidden nav:inline-flex">
                <ConsoleAction />
              </span>
              <Button
                href={primaryCtaHref}
                className="btn-nav hidden nav:inline-flex"
              >
                {ctaLabel}
              </Button>
              <button
                ref={menuButtonRef}
                type="button"
                className="nav:hidden inline-flex h-11 w-11 items-center justify-center rounded-sm border border-border-interactive text-text-primary transition-colors hover:bg-surface-interactive"
                aria-expanded={open}
                aria-controls="mobile-nav"
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen((value) => !value)}
              >
                <span
                  className={`flex h-4 w-4 flex-col ${open ? "justify-center gap-1.5" : "justify-between"}`}
                  aria-hidden="true"
                >
                  <span
                    className={`block h-px w-4 bg-current transition-transform duration-150 ${open ? "rotate-45" : ""}`}
                  />
                  <span
                    className={`block h-px w-4 bg-current transition-transform duration-150 ${open ? "-rotate-45" : ""}`}
                  />
                </span>
              </button>
            </div>
          </div>

          {open ? (
            <div
              ref={dialogRef}
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              className="glass-modal site-nav-menu nav:hidden pointer-events-auto mt-2 flex flex-col overflow-hidden rounded-[14px] border border-[var(--glass-border)]"
            >
              <nav
                aria-label="Mobile"
                data-lenis-prevent=""
                className="flex-1 overflow-y-auto overscroll-contain"
              >
                <ul className="flex flex-col">
                  {navItems.map((item) => (
                    <li
                      key={item.href}
                      className="border-b border-border-subtle"
                    >
                      <Link
                        className="flex min-h-14 items-center px-5 text-2xl text-text-primary"
                        href={item.href}
                        aria-current={
                          isActive(pathname, item.href) ? "page" : undefined
                        }
                        onClick={() => setOpen(false)}
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                  <li className="border-b border-border-subtle">
                    <div className="flex min-h-14 items-center justify-between px-5">
                      <ConsoleAction />
                    </div>
                  </li>
                </ul>
              </nav>
              <div className="border-t border-border-subtle p-5">
                <Button
                  href={primaryCtaHref}
                  size="lg"
                  className="w-full"
                  onClick={() => setOpen(false)}
                >
                  {ctaLabel}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
