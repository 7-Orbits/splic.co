"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { getAuthErrorInfo } from "@/lib/auth/errors";
import { showAuthErrorToast } from "@/lib/auth/toast";
import { safeAuthRedirect } from "@/lib/auth/redirect";

/**
 * Reusable hook to detect authentication error query parameters, display a
 * user-friendly toast, and cleanly strip the error parameter from the URL
 * without triggering a full page reload or open redirect vulnerabilities.
 */
export function useAuthErrorHandler() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastHandledErrorRef = useRef<string | null>(null);

  useEffect(() => {
    const errorCode = searchParams.get("error");

    // When no error is in the URL, reset the ref so subsequent errors in the session can trigger.
    if (!errorCode) {
      lastHandledErrorRef.current = null;
      return;
    }

    // De-duplicate: avoid re-triggering if this specific error is already being handled
    // (e.g. React StrictMode double mount or component re-render before URL cleanup).
    if (lastHandledErrorRef.current === errorCode) {
      return;
    }
    lastHandledErrorRef.current = errorCode;

    const errorInfo = getAuthErrorInfo(errorCode);
    if (errorInfo) {
      showAuthErrorToast(errorInfo);
    }

    // Clean up query parameters: remove error and error_description
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("error");
    nextParams.delete("error_description");

    // Validate and sanitize the redirect destination to prevent open redirects
    const rawRedirect = nextParams.get("redirect");
    if (rawRedirect) {
      nextParams.set("redirect", safeAuthRedirect(rawRedirect));
    }

    const nextQuery = nextParams.toString();
    const cleanUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

    // Immediately sanitize browser address bar and history
    window.history.replaceState(window.history.state, "", cleanUrl);
    // Sync Next.js client router without scrolling or reload
    router.replace(cleanUrl, { scroll: false });
  }, [searchParams, pathname, router]);
}
