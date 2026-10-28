"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronDown,
  LifeBuoy,
  LogOut,
  Settings,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/components/auth/auth-provider";
import type { ConsoleAccount } from "@/lib/console/types";

interface ConsoleUserMenuProps {
  account: ConsoleAccount;
  onNavigate?: () => void;
}

interface MenuItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  onClick?: () => void;
  isAction?: boolean;
}

const menuLinks: MenuItem[] = [
  { label: "Settings", href: "/console/settings", icon: Settings },
  { label: "Help & Support", href: "/console/help", icon: LifeBuoy },
];

export function ConsoleUserMenu({ account, onNavigate }: ConsoleUserMenuProps) {
  const router = useRouter();
  const { user, status, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<Array<HTMLElement | null>>([]);

  const isAuthenticated = status === "authenticated";
  const displayName =
    isAuthenticated && (user?.name || user?.email)
      ? user?.name || user?.email
      : account.name;
  const displayEmail =
    isAuthenticated && user?.email ? user.email : account.email;

  function getInitials(name?: string | null, email?: string | null): string {
    if (name) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return parts[0].slice(0, 2).toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return account.initials;
  }

  const displayInitials = isAuthenticated
    ? getInitials(user?.name, user?.email)
    : account.initials;

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  function focusItem(index: number) {
    const items = itemRefs.current.filter(
      (item): item is HTMLElement => item !== null,
    );
    if (items.length === 0) return;
    items[(index + items.length) % items.length]?.focus();
  }

  const handleSignOut = async () => {
    setOpen(false);
    onNavigate?.();
    await signOut();
    router.push("/auth");
  };

  const items: MenuItem[] = [
    ...menuLinks,
    isAuthenticated
      ? { label: "Sign out", icon: LogOut, isAction: true, onClick: handleSignOut }
      : { label: "Exit preview", href: "/", icon: LogOut, isAction: true },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowUp" || event.key === "ArrowDown") {
            event.preventDefault();
            setOpen(true);
            requestAnimationFrame(() => focusItem(0));
          }
        }}
        className="flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors hover:bg-white/[0.05]"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border-default bg-surface-elevated text-xs font-semibold text-text-primary">
          {displayInitials}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-md font-medium text-text-primary">
            {displayName}
          </span>
          <span className="block truncate text-xs text-text-tertiary">
            {displayEmail}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 text-text-tertiary transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute bottom-full left-0 z-30 mb-2 w-full overflow-hidden rounded-md border border-border-default bg-surface-elevated py-1 shadow-product"
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              focusItem(itemRefs.current.indexOf(document.activeElement as HTMLElement) + 1);
            } else if (event.key === "ArrowUp") {
              event.preventDefault();
              focusItem(itemRefs.current.indexOf(document.activeElement as HTMLElement) - 1);
            } else if (event.key === "Home") {
              event.preventDefault();
              focusItem(0);
            } else if (event.key === "End") {
              event.preventDefault();
              focusItem(items.length - 1);
            }
          }}
        >
          {items.map((item, index) => {
            const Icon = item.icon;
            if (item.onClick) {
              return (
                <button
                  key={item.label}
                  type="button"
                  ref={(node) => {
                    itemRefs.current[index] = node;
                  }}
                  role="menuitem"
                  onClick={item.onClick}
                  className="flex w-full cursor-pointer items-center gap-2.5 border-t border-border-subtle px-3 py-2 text-left text-md text-text-secondary transition-colors hover:bg-surface-interactive"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                  {item.label}
                </button>
              );
            }

            return (
              <Link
                key={item.label}
                ref={(node) => {
                  itemRefs.current[index] = node;
                }}
                role="menuitem"
                href={item.href || "/"}
                onClick={() => {
                  setOpen(false);
                  onNavigate?.();
                }}
                className={`flex items-center gap-2.5 px-3 py-2 text-md transition-colors hover:bg-surface-interactive ${
                  item.isAction
                    ? "border-t border-border-subtle text-text-secondary"
                    : "text-text-primary"
                }`}
              >
                <Icon aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
                {item.label}
              </Link>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
