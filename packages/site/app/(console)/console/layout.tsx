import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsoleShell } from "@/components/console/console-shell";
import { previewConsoleData } from "@/lib/console/preview-data";

export const metadata: Metadata = {
  title: {
    default: "Console",
    template: "%s · Splic Console",
  },
  description:
    "Preview of the Splic Console account dashboard. Sample data only.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ConsoleLayout({ children }: { children: ReactNode }) {
  return (
    <ConsoleShell
      account={previewConsoleData.account}
      preview={previewConsoleData.preview}
    >
      {children}
    </ConsoleShell>
  );
}
