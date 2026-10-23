import {
  Blocks,
  Cloud,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LifeBuoy,
  ReceiptText,
  Settings,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";

export interface ConsoleNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface ConsoleNavGroup {
  label: string;
  items: ConsoleNavItem[];
}

export const consoleNavGroups: ConsoleNavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/console", icon: LayoutDashboard },
      { label: "Plugins", href: "/console/plugins", icon: Blocks },
      { label: "Usage & Limits", href: "/console/usage", icon: Gauge },
      { label: "Cloud Storage", href: "/console/storage", icon: Cloud },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Billing & Plans", href: "/console/billing", icon: CreditCard },
      {
        label: "Orders & Purchases",
        href: "/console/orders",
        icon: ReceiptText,
      },
    ],
  },
  {
    label: "Access",
    items: [
      { label: "Security", href: "/console/security", icon: ShieldCheck },
      { label: "Settings", href: "/console/settings", icon: Settings },
    ],
  },
  {
    label: "Support",
    items: [
      { label: "Help & Support", href: "/console/help", icon: LifeBuoy },
    ],
  },
];

export const consoleNavItems = consoleNavGroups.flatMap((group) => group.items);

export function consoleNavLabel(pathname: string): string {
  if (pathname === "/console") return "Overview";
  const item = consoleNavItems.find((navItem) =>
    pathname.startsWith(navItem.href),
  );
  return item?.label ?? "Console";
}

export function isConsoleNavActive(pathname: string, href: string): boolean {
  if (href === "/console") return pathname === "/console";
  return pathname === href || pathname.startsWith(`${href}/`);
}
