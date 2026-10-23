"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Wordmark } from "@/components/wordmark";
import {
  consoleNavGroups,
  isConsoleNavActive,
} from "@/lib/console/nav";
import type { ConsoleAccount } from "@/lib/console/types";
import { ConsoleUserMenu } from "./console-user-menu";

interface ConsoleSidebarProps {
  account: ConsoleAccount;
  onNavigate?: () => void;
}

export function ConsoleSidebar({ account, onNavigate }: ConsoleSidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface-primary">
      <div className="flex h-16 shrink-0 items-center border-b border-border-subtle px-4">
        <Link
          href="/"
          aria-label="Splic — marketing site"
          className="rounded-sm transition-opacity hover:opacity-80"
          onClick={onNavigate}
        >
          <Wordmark withHandle />
        </Link>
      </div>

      <nav
        aria-label="Console"
        data-lenis-prevent=""
        className="flex-1 overflow-y-auto px-3 py-4"
      >
        {consoleNavGroups.map((group, groupIndex) => (
          <div
            key={group.label}
            className={
              groupIndex === 0
                ? ""
                : "mt-4 border-t border-border-subtle pt-4"
            }
          >
            <p className="px-2.5 pb-1.5 text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
              {group.label}
            </p>
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => {
                const active = isConsoleNavActive(pathname, item.href);
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      data-active={active}
                      aria-current={active ? "page" : undefined}
                      onClick={onNavigate}
                      className={`relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-md transition-colors ${
                        active
                          ? "bg-white/[0.07] text-text-primary"
                          : "text-text-secondary hover:bg-white/[0.04] hover:text-text-primary"
                      }`}
                    >
                      {active ? (
                        <span
                          aria-hidden="true"
                          className="absolute bottom-1.5 left-0 top-1.5 w-0.5 rounded-full bg-accent-primary"
                        />
                      ) : null}
                      <Icon
                        aria-hidden="true"
                        className={`h-4 w-4 shrink-0 ${
                          active ? "text-text-primary" : "text-text-tertiary"
                        }`}
                        strokeWidth={1.8}
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="shrink-0 border-t border-border-subtle p-2.5">
        <ConsoleUserMenu account={account} onNavigate={onNavigate} />
      </div>
    </div>
  );
}
