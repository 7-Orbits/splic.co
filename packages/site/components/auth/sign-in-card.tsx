"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle } from "lucide-react";
import { Wordmark } from "@/components/wordmark";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/auth-provider";
import { useAuthErrorHandler } from "@/hooks/use-auth-error-handler";
import type { AuthProviderId, AuthProviderSummary } from "@/lib/auth/providers";

interface SignInCardProps {
  /** Safe, validated post-auth destination. Defaults to /console. */
  redirectTo: string;
  /** OAuth error code returned by the callback, if any (deprecated in favor of toast notification). */
  error?: string | null;
  /** Server-computed provider summaries so buttons render with the correct
   * configured state in SSR instead of popping in after hydration. */
  initialProviders?: AuthProviderSummary[];
}

function GoogleIcon({ className = "h-5 w-5" }: { className?: string }) {
  // Original multicolor Google "G" logo.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.53-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09C6.22 6.86 8.87 4.75 12 4.75z"
      />
    </svg>
  );
}

function MicrosoftIcon({ className = "h-5 w-5" }: { className?: string }) {
  // Original four-color Microsoft logo.
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path fill="#F25022" d="M0 0h11.5v11.5H0z" />
      <path fill="#7FBA00" d="M12.5 0H24v12.5H12.5z" />
      <path fill="#00A4EF" d="M0 12.5H11.5V24H0z" />
      <path fill="#FFB900" d="M12.5 12.5H24V24H12.5z" />
    </svg>
  );
}

function ProviderIcon({
  providerId,
  className = "h-5 w-5",
}: {
  providerId: AuthProviderId;
  className?: string;
}) {
  if (providerId === "google") return <GoogleIcon className={className} />;
  if (providerId === "microsoft") return <MicrosoftIcon className={className} />;
  return null;
}

export function SignInCard({
  redirectTo,
  initialProviders,
}: SignInCardProps) {
  const router = useRouter();
  const { status, providers: sessionProviders, signIn } = useAuth();

  // Handle URL auth error query parameters and toasts cleanly
  useAuthErrorHandler();
  // Prefer the live session data; fall back to the server-rendered summaries
  // so the very first paint (and SSR HTML) shows both provider buttons.
  const providers = sessionProviders.length
    ? sessionProviders
    : (initialProviders ?? []);
  const [pendingProvider, setPendingProvider] = useState<AuthProviderId | null>(
    null,
  );

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(redirectTo);
    }
  }, [status, redirectTo, router]);

  const handleSignIn = (providerId: AuthProviderId) => {
    if (pendingProvider) return;
    const provider = providers.find((entry) => entry.id === providerId);
    if (!provider?.configured) return;
    setPendingProvider(providerId);
    signIn(providerId, redirectTo);
  };

  return (
    <div className="flex w-full flex-col items-center text-center">
      <Wordmark markSize={30} />
      <h1 className="mt-6 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
        Welcome back to Splic
      </h1>

      <div className="mt-8 flex w-full flex-col gap-3">
        {providers.map((provider) => (
          <Button
            key={provider.id}
            variant="auth"
            className="w-full"
            disabled={pendingProvider !== null || !provider.configured}
            onClick={() => handleSignIn(provider.id)}
            aria-busy={pendingProvider === provider.id}
          >
            {pendingProvider === provider.id ? (
              <>
                <LoaderCircle
                  aria-hidden="true"
                  className="h-4 w-4 animate-spin"
                />
                <span>Continue with {provider.name}</span>
              </>
            ) : (
              <>
                <ProviderIcon providerId={provider.id} />
                <span>Continue with {provider.name}</span>
              </>
            )}
          </Button>
        ))}
      </div>

      <p className="mt-5 w-full text-center text-sm leading-[1.6] text-text-secondary">
        By continuing, you agree to Splic&apos;s{" "}
        <Link
          href="/terms"
          className="text-text-primary/80 underline underline-offset-2 transition-colors hover:text-white focus-visible:text-white"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-text-primary/80 underline underline-offset-2 transition-colors hover:text-white focus-visible:text-white"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
