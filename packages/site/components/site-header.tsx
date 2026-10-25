"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import {
  Film,
  Bot,
  Puzzle,
  Sliders,
  Workflow,
  Download,
  ChevronDown,
} from "lucide-react";
import { Wordmark } from "./wordmark";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import { Button } from "@/components/ui/button";
import {
  primaryCtaHref,
  primaryNav,
  productMegaMenuSections,
  productBottomStrip,
  type MegaMenuItem,
} from "@/content/navigation";
import { siteConfig } from "@/lib/site-config";

const navItems = primaryNav;

/** Navbar pill label (Linear "Sign up" slot). Routes to the real
 * /download page, which renders the honest release-stage state. */
const ctaLabel = "Download";
const consoleHref = siteConfig.links.console;

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function MenuIcon({
  name,
  className = "",
}: {
  name: MegaMenuItem["iconName"];
  className?: string;
}) {
  switch (name) {
    case "Film":
      return <Film className={className} aria-hidden="true" />;
    case "Bot":
      return <Bot className={className} aria-hidden="true" />;
    case "Puzzle":
      return <Puzzle className={className} aria-hidden="true" />;
    case "Sliders":
      return <Sliders className={className} aria-hidden="true" />;
    case "Workflow":
      return <Workflow className={className} aria-hidden="true" />;
    case "Download":
      return <Download className={className} aria-hidden="true" />;
    default:
      return null;
  }
}

/** Console action: the in-repo preview, or an env-configured hosted Console. */
function ConsoleAction({ className = "" }: { className?: string }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const classes = `inline-flex items-center text-md leading-none text-text-secondary transition-colors duration-150 hover:text-text-primary ${className}`;

  function handleClick() {
    if (status === "authenticated") {
      const consoleHref = siteConfig.links.console;
      if (consoleHref?.startsWith("/")) {
        router.push(consoleHref);
      } else if (consoleHref) {
        window.open(consoleHref, "_blank", "noopener,noreferrer");
      }
      return;
    }

    // Unauthenticated visitors are sent through the auth flow, returning to
    // the current page as the safe post-auth destination.
    const redirectTo = pathname && pathname !== "/" ? pathname : "/console";
    router.push(`/auth?redirect=${encodeURIComponent(redirectTo)}`);
  }

  if (consoleHref?.startsWith("/")) {
    return (
      <Link href={consoleHref} className={classes} onClick={handleClick}>
        Console
      </Link>
    );
  }

  return (
    <a href={consoleHref ?? undefined} className={classes} onClick={handleClick}>
      Console
    </a>
  );
}

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [mobileProductOpen, setMobileProductOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const productTriggerRef = useRef<HTMLButtonElement>(null);
  const productMenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const pathname = usePathname();
  const { stop, start } = useSmoothScroll();

  const isProductActive =
    productOpen ||
    pathname === "/how-it-works" ||
    pathname.startsWith("/how-it-works/");

  const handleMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setProductOpen(true);
  };

  const handleMouseLeave = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
    }
    closeTimeoutRef.current = setTimeout(() => {
      setProductOpen(false);
    }, 150);
  };

  const handleTriggerKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (
      event.key === "ArrowDown" ||
      event.key === "Enter" ||
      event.key === " "
    ) {
      event.preventDefault();
      setProductOpen(true);
      requestAnimationFrame(() => {
        const firstLink =
          productMenuRef.current?.querySelector<HTMLAnchorElement>("a");
        firstLink?.focus();
      });
    } else if (event.key === "Escape") {
      event.preventDefault();
      setProductOpen(false);
    }
  };

  const handleMenuKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setProductOpen(false);
      productTriggerRef.current?.focus();
    }
  };

  const handleBlur = (event: React.FocusEvent) => {
    if (
      !productMenuRef.current?.contains(event.relatedTarget as Node) &&
      !productTriggerRef.current?.contains(event.relatedTarget as Node)
    ) {
      setProductOpen(false);
    }
  };

  // Close mega-menu on outside click or global Escape
  useEffect(() => {
    if (!productOpen) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null;
      if (
        productMenuRef.current?.contains(target) ||
        productTriggerRef.current?.contains(target)
      ) {
        return;
      }
      setProductOpen(false);
    };

    const handleGlobalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setProductOpen(false);
        productTriggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    document.addEventListener("keydown", handleGlobalKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  }, [productOpen]);

  const [prevPathname, setPrevPathname] = useState(pathname);
  if (pathname !== prevPathname) {
    setPrevPathname(pathname);
    setProductOpen(false);
    setOpen(false);
    setMobileProductOpen(false);
  }

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  // Trap focus & lock scroll for mobile nav dialog
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
            className="glass-nav nav-bar flex items-center justify-between px-4 lg:px-5"
          >
            <div className="flex items-center shrink-0">
              <Link
                href="/"
                aria-label="Splic — home"
                className="inline-flex items-center transition-opacity hover:opacity-80"
              >
                <Wordmark markSize={18} />
              </Link>
            </div>

            <nav aria-label="Primary" className="hidden nav:block">
              <ul className="flex items-center gap-6">
                {/* Product item with 3-column mega-menu */}
                <li
                  className="relative"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  onBlur={handleBlur}
                >
                  <button
                    ref={productTriggerRef}
                    type="button"
                    className="nav-link group inline-flex items-center gap-1.5 py-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base rounded-xs"
                    aria-expanded={productOpen}
                    aria-haspopup="true"
                    aria-controls="product-mega-menu"
                    onClick={() => setProductOpen((prev) => !prev)}
                    onKeyDown={handleTriggerKeyDown}
                    data-active={isProductActive}
                  >
                    <span>Product</span>
                    <ChevronDown
                      className={`h-3 w-3 transition-transform duration-150 ${
                        productOpen
                          ? "rotate-180 text-text-primary"
                          : "text-text-secondary group-hover:text-text-primary"
                      }`}
                      aria-hidden="true"
                    />
                  </button>

                  {/* 3-column mega-menu dropdown panel */}
                  <div
                    ref={productMenuRef}
                    id="product-mega-menu"
                    role="region"
                    aria-label="Product menu"
                    onKeyDown={handleMenuKeyDown}
                    className={`glass-mega-menu absolute left-0 top-[calc(100%+8px)] w-[min(640px,calc(100vw-3rem))] rounded-xl overflow-hidden z-50 transition-all duration-200 ease-out motion-reduce:transition-none motion-reduce:transform-none before:absolute before:inset-x-0 before:-top-3 before:h-3 before:content-[''] ${
                      productOpen
                        ? "opacity-100 translate-y-0 pointer-events-auto"
                        : "opacity-0 -translate-y-1.5 pointer-events-none"
                    }`}
                  >
                    {/* Inset top highlight */}
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/[0.07]"
                    />

                    {/* 3 Columns */}
                    <div className="grid grid-cols-3 gap-2 p-3.5">
                      {productMegaMenuSections.map((section) => (
                        <div key={section.title} className="flex flex-col">
                          <div className="px-2.5 py-1 font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
                            {section.title}
                          </div>
                          <div className="mt-1 flex flex-col gap-0.5">
                            {section.items.map((item) => (
                              <Link
                                key={item.label}
                                href={item.href}
                                onClick={() => setProductOpen(false)}
                                className="group flex flex-col rounded-md px-2.5 py-2 transition-colors duration-150 hover:bg-white/[0.05] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40"
                              >
                                <span className="flex items-center gap-2 text-sm font-medium text-text-primary transition-colors">
                                  <MenuIcon
                                    name={item.iconName}
                                    className="h-3.5 w-3.5 shrink-0 text-text-tertiary group-hover:text-text-secondary transition-colors"
                                  />
                                  <span>{item.label}</span>
                                </span>
                                <span className="mt-0.5 text-xs text-text-secondary leading-snug line-clamp-1">
                                  {item.description}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Bottom strip — dark, neutral, no accent tint */}
                    <div className="flex items-center justify-between border-t border-white/[0.06] bg-black/30 px-4 py-2.5 text-xs">
                      <span className="text-text-tertiary">
                        {productBottomStrip.text}
                      </span>
                      <Link
                        href={productBottomStrip.href}
                        onClick={() => setProductOpen(false)}
                        className="inline-flex items-center gap-1 font-medium text-text-secondary hover:text-text-primary transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white/40 rounded-xs"
                      >
                        <span>{productBottomStrip.linkText}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </li>

                {/* Remaining primary nav links */}
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

            <div className="flex items-center gap-3 lg:gap-4 shrink-0">
              <div className="hidden nav:flex items-center gap-4 lg:gap-4.5">
                <span
                  className="h-3.5 w-px bg-border-default/80"
                  aria-hidden="true"
                />
                <ConsoleAction />
                <Button
                  href={primaryCtaHref}
                  className="btn-nav"
                >
                  {ctaLabel}
                </Button>
              </div>
              {/* Mobile: Console link visible before hamburger */}
              <ConsoleAction className="nav:hidden mr-1" />
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
                  {/* Product expandable accordion on mobile */}
                  <li className="border-b border-border-subtle">
                    <button
                      type="button"
                      className="flex min-h-14 w-full items-center justify-between px-5 text-2xl text-text-primary text-left"
                      aria-expanded={mobileProductOpen}
                      onClick={() => setMobileProductOpen((prev) => !prev)}
                    >
                      <span>Product</span>
                      <ChevronDown
                        className={`h-5 w-5 text-text-secondary transition-transform duration-200 ${
                          mobileProductOpen ? "rotate-180 text-text-primary" : ""
                        }`}
                        aria-hidden="true"
                      />
                    </button>
                    {mobileProductOpen && (
                      <div className="bg-surface-primary/60 px-5 pb-4 pt-1 flex flex-col gap-4">
                        {productMegaMenuSections.map((section) => (
                          <div key={section.title} className="flex flex-col gap-1.5">
                            <div className="font-mono text-xs uppercase tracking-[0.16em] text-text-tertiary">
                              {section.title}
                            </div>
                            <div className="flex flex-col gap-1 pl-1">
                              {section.items.map((item) => (
                                <Link
                                  key={item.label}
                                  href={item.href}
                                  className="flex flex-col py-1.5 group"
                                  onClick={() => setOpen(false)}
                                >
                                  <span className="flex items-center gap-2 text-md font-medium text-text-primary group-hover:text-accent-primary">
                                    <MenuIcon
                                      name={item.iconName}
                                      className="h-3.5 w-3.5 text-text-secondary group-hover:text-accent-primary shrink-0"
                                    />
                                    <span>{item.label}</span>
                                  </span>
                                  <span className="text-xs text-text-secondary">
                                    {item.description}
                                  </span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                        <div className="border-t border-border-subtle pt-3 text-xs flex flex-col gap-1.5">
                          <span className="text-text-secondary">
                            {productBottomStrip.text}
                          </span>
                          <Link
                            href={productBottomStrip.href}
                            onClick={() => setOpen(false)}
                            className="text-accent-primary font-medium inline-flex items-center gap-1"
                          >
                            <span>{productBottomStrip.linkText}</span>
                            <span aria-hidden="true">→</span>
                          </Link>
                        </div>
                      </div>
                    )}
                  </li>

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
