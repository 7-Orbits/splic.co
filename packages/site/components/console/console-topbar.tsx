"use client";

import { usePathname } from "next/navigation";
import { ChevronRight, FlaskConical, Menu } from "lucide-react";
import { consoleNavLabel } from "@/lib/console/nav";

interface ConsoleTopbarProps {
  onOpenMenu: () => void;
  menuOpen: boolean;
}

export function ConsoleTopbar({ onOpenMenu, menuOpen }: ConsoleTopbarProps) {
  const pathname = usePathname();
  const label = consoleNavLabel(pathname);

  return (
    <header className="sticky top-0 z-20 border-b border-border-subtle bg-surface-base/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-5 sm:px-7 lg:px-10">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open console navigation"
          aria-expanded={menuOpen}
          aria-controls="console-mobile-nav"
          className="flex h-8 w-8 items-center justify-center rounded-sm border border-border-interactive text-text-primary transition-colors hover:bg-surface-interactive lg:hidden"
        >
          <Menu aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
        </button>

        <nav aria-label="Breadcrumb" className="min-w-0">
          <ol className="flex items-center gap-1.5 text-md">
            <li className="hidden text-text-tertiary sm:block">Console</li>
            <li aria-hidden="true" className="hidden sm:block">
              <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
            </li>
            <li
              aria-current="page"
              className="truncate font-medium text-text-primary"
            >
              {label}
            </li>
          </ol>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border-default px-2.5 py-1 text-xs font-medium text-text-tertiary sm:inline-flex">
            <FlaskConical aria-hidden="true" className="h-3 w-3" />
            Preview
          </span>
        </div>
      </div>
    </header>
  );
}
