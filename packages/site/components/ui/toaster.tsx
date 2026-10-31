"use client";

import { Toaster as SonnerToaster } from "sonner";
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from "lucide-react";

/**
 * Global Toaster component aligned with Splic's dark visual system:
 * - Surfaces: elevated dark slate (#121419 / #181b21)
 * - Borders: subtle charcoal edge (#30343d)
 * - Typography: Inter font stack with crisp hierarchy
 * - Accents: Splic system status tokens for error, info, warning, and success
 */
export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-right"
      richColors={false}
      closeButton
      gap={8}
      toastOptions={{
        style: {
          background: "#121419",
          borderColor: "#30343d",
          color: "#f7f8f8",
          borderRadius: "12px",
          boxShadow: "0 8px 28px rgba(0, 0, 0, 0.4)",
          fontFamily: "var(--font-inter), sans-serif",
        },
        classNames: {
          toast:
            "group font-sans !bg-[#121419] !text-[#f7f8f8] !border-[#30343d] !rounded-[12px] shadow-[0_8px_28px_rgba(0,0,0,0.4)] text-[13px] p-4",
          title: "!text-[#f7f8f8] !font-medium text-[13px] tracking-tight",
          description: "!text-[#8a8f98] text-[12.5px] leading-relaxed mt-0.5",
          actionButton:
            "!bg-[#f7f8f8] !text-[#101115] text-xs font-medium rounded-md",
          cancelButton:
            "!bg-[#20242b] !text-[#8a8f98] text-xs font-medium rounded-md",
          closeButton:
            "!bg-[#181b21] !border-[#30343d] !text-[#8a8f98] hover:!text-[#f7f8f8]",
          error: "!border-[#f08a8a]/40",
          warning: "!border-[#e7bc78]/40",
          info: "!border-[#8cbfcb]/40",
          success: "!border-[#80c9a0]/40",
        },
      }}
      icons={{
        error: (
          <AlertCircle
            className="h-4 w-4 text-[#f08a8a] shrink-0"
            aria-hidden="true"
          />
        ),
        warning: (
          <AlertTriangle
            className="h-4 w-4 text-[#e7bc78] shrink-0"
            aria-hidden="true"
          />
        ),
        info: (
          <Info
            className="h-4 w-4 text-[#8cbfcb] shrink-0"
            aria-hidden="true"
          />
        ),
        success: (
          <CheckCircle2
            className="h-4 w-4 text-[#80c9a0] shrink-0"
            aria-hidden="true"
          />
        ),
      }}
    />
  );
}
