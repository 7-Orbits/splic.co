"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { useSmoothScroll } from "@/components/motion/smooth-scroll";
import type { ConsoleAccount, ConsolePreviewMeta } from "@/lib/console/types";
import { ConsoleSidebar } from "./console-sidebar";
import { ConsoleTopbar } from "./console-topbar";
import { PreviewBanner } from "./preview-banner";

interface ConsoleShellProps {
  account: ConsoleAccount;
  preview: ConsolePreviewMeta;
  children: ReactNode;
}

export function ConsoleShell({
  account,
  preview,
  children,
}: ConsoleShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const { stop, start } = useSmoothScroll();

  useEffect(() => {
    if (!menuOpen) return;

    stop();

    const previouslyFocused =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () => {
      const root = drawerRef.current;
      if (!root) return [] as HTMLElement[];
      return Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && active === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    const raf = requestAnimationFrame(() => {
      const close = drawerRef.current?.querySelector<HTMLElement>(
        "[data-drawer-close]",
      );
      (close ?? focusables()[0])?.focus();
    });

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(raf);
      document.body.style.overflow = previousOverflow;
      start();
      previouslyFocused?.focus();
    };
  }, [menuOpen, start, stop]);

  return (
    <div className="min-h-screen bg-surface-base">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border-subtle lg:block">
        <ConsoleSidebar account={account} />
      </aside>

      <div className="lg:pl-64">
        <ConsoleTopbar
          onOpenMenu={() => setMenuOpen(true)}
          menuOpen={menuOpen}
        />
        <PreviewBanner preview={preview} />
        <main
          id="main"
          className="mx-auto w-full max-w-[1180px] px-5 py-6 sm:px-7 lg:px-10 lg:py-8"
        >
          {children}
        </main>
      </div>

      {menuOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
            onClick={() => setMenuOpen(false)}
          />
          <div
            ref={drawerRef}
            id="console-mobile-nav"
            role="dialog"
            aria-modal="true"
            aria-label="Console navigation"
            className="absolute inset-y-0 left-0 w-[280px] max-w-[85vw] border-r border-border-default shadow-product"
          >
            <button
              type="button"
              data-drawer-close=""
              onClick={() => setMenuOpen(false)}
              aria-label="Close console navigation"
              className="absolute right-3 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-sm border border-border-interactive bg-surface-elevated text-text-primary transition-colors hover:bg-surface-interactive"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
            <ConsoleSidebar
              account={account}
              onNavigate={() => setMenuOpen(false)}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
