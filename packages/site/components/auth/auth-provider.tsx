"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthProviderId, AuthProviderSummary } from "@/lib/auth/providers";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  providers: AuthProviderSummary[];
  /** Start the OAuth sign-in / sign-up flow for a provider. */
  signIn: (providerId: AuthProviderId, redirectTo?: string) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [providers, setProviders] = useState<AuthProviderSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const response = await fetch("/api/auth/session", {
          credentials: "same-origin",
        });
        const data = (await response.json().catch(() => null)) as {
          authenticated?: boolean;
          providers?: AuthProviderSummary[];
        } | null;

        if (cancelled) return;
        setStatus(data?.authenticated ? "authenticated" : "unauthenticated");
        if (Array.isArray(data?.providers)) {
          setProviders(data.providers);
        }
      } catch {
        if (!cancelled) setStatus("unauthenticated");
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    (providerId: AuthProviderId, redirectTo?: string) => {
      const signInUrl = new URL(
        `/api/auth/signin/${providerId}`,
        window.location.origin,
      );
      if (redirectTo) signInUrl.searchParams.set("redirect", redirectTo);
      window.location.href = signInUrl.toString();
    },
    [],
  );

  return (
    <AuthContext.Provider value={{ status, providers, signIn }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
