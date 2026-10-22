"use client";

import { useEffect, useRef, useState } from "react";
import { Cta } from "./cta";
import { Wordmark } from "./wordmark";
import { downloadHref } from "@/lib/site-config";

const navItems = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "#pricing" },
  { label: "Download", href: "#download" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointerDown = (event: PointerEvent) => {
      if (!headerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onResize = () => {
      if (window.innerWidth >= 768) setOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("resize", onResize);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 border-b transition-colors ${
        scrolled || open
          ? "border-line bg-surface-base/85 backdrop-blur-md"
          : "border-transparent bg-surface-base/40 backdrop-blur-sm"
      }`}
    >
      <div className="container-page flex h-14 items-center justify-between gap-8">
        <a href="#top" aria-label="Splic — back to top">
          <Wordmark />
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-8">
            {navItems.map((item) => (
              <li key={item.href}>
                <a className="nav-link" href={item.href}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex">
            <Cta href={downloadHref}>Download Splic</Cta>
          </span>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xs border border-line-strong text-text-primary transition-colors hover:border-text-tertiary hover:bg-surface-strong md:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span
              className={`flex h-4 w-4 flex-col transition-transform duration-200 ${
                open ? "justify-center gap-1" : "justify-between"
              }`}
              aria-hidden="true"
            >
              <span
                className={`block h-px w-4 bg-current transition-transform duration-200 ${
                  open ? "rotate-45" : ""
                }`}
              />
              <span
                className={`block h-px w-4 bg-current transition-transform duration-200 ${
                  open ? "-rotate-45" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={`border-t border-line bg-surface-base/95 backdrop-blur-md md:hidden ${
          open ? "block" : "hidden"
        }`}
      >
        <nav aria-label="Mobile" className="container-page py-6">
          <ul className="flex flex-col">
            {navItems.map((item) => (
              <li key={item.href}>
                <a
                  className="nav-link block py-4"
                  href={item.href}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <Cta
            href={downloadHref}
            className="mt-4 w-full"
            onClick={() => setOpen(false)}
          >
            Download Splic
          </Cta>
        </nav>
      </div>
    </header>
  );
}
