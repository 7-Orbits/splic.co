"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  gatewayUrl,
  type AuthProviderId,
  type AuthProviderSummary,
  type AuthUser,
} from "@/lib/auth/providers";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

interface AuthContextValue {
  status: AuthStatus;
  /** Current Gateway user profile once authenticated, otherwise null. */
  user: AuthUser | null;
  providers: AuthProviderSummary[];
  /** Start the Gateway's Google sign-in flow (login-only — no signup). */
  signIn: (providerId: AuthProviderId, redirectTo?: string) => void;
  /** Revoke the Gateway session and drop local auth state. */
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface MeResponse {
  authenticated?: boolean;
  user?: AuthUser;
}

interface ProvidersResponse {
  providers?: AuthProviderSummary[];
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<AuthUser | null>(null);
  const [providers, setProviders] = useState<AuthProviderSummary[]>([]);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      const base = gatewayUrl();
      try {
        const [meResponse, providersResponse] = await Promise.all([
          fetch(`${base}/auth/me`, { credentials: "include" }),
          fetch(`${base}/auth/providers`, { credentials: "include" }),
        ]);

        const me = (await meResponse.json().catch(() => null)) as MeResponse | null;
        const providerData = (await providersResponse.json().catch(() => null)) as
          | ProvidersResponse
          | null;

        if (cancelled) return;

        const authenticated =
          meResponse.ok && me?.authenticated === true && Boolean(me.user);
        setStatus(authenticated ? "authenticated" : "unauthenticated");
        setUser(authenticated && me?.user ? me.user : null);
        if (Array.isArray(providerData?.providers)) {
          setProviders(providerData.providers);
        }
      } catch {
        // Gateway unreachable: treat as signed out — never assume a session.
        if (!cancelled) {
          setStatus("unauthenticated");
          setUser(null);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  const signIn = useCallback(
    (providerId: AuthProviderId, redirectTo?: string) => {
      // Only Google is wired: the Gateway owns the flow and the Microsoft
      // button stays disabled until its credentials are configured.
      if (providerId !== "google") return;
      const signInUrl = new URL("/auth/google", gatewayUrl());
      if (redirectTo) signInUrl.searchParams.set("redirect", redirectTo);
      window.location.href = signInUrl.toString();
    },
    [],
  );

  const signOut = useCallback(async () => {
    try {
      await fetch(`${gatewayUrl()}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch {
      // Network failure: the session cookie lives on the Gateway origin and
      // cannot be cleared from here; /auth/me re-syncs on the next load.
    }
    setStatus("unauthenticated");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ status, user, providers, signIn, signOut }}>
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
