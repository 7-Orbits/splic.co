import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { AmbientGlow } from "@/components/ui/ambient-glow";
import { SignInCard } from "@/components/auth/sign-in-card";
import { safeAuthRedirect } from "@/lib/auth/redirect";
import {
  authErrorMessage,
  getAuthProviderSummaries,
} from "@/lib/auth/providers";

/**
 * Dedicated sign-in screen. Intentionally rendered outside the `(site)` route
 * group so it ships no navbar, footer, or marketing chrome — just the Splic
 * logo, heading, and the two provider buttons, centered in the viewport.
 */
export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to the Splic console with Google or Microsoft. New to Splic? Continue with an identity provider to create your account.",
};

interface AuthPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function firstParamValue(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

async function AuthScreen({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const redirectTo = safeAuthRedirect(firstParamValue(params.redirect) ?? undefined);
  const error = authErrorMessage(firstParamValue(params.error));

  return (
    <SignInCard
      redirectTo={redirectTo}
      error={error}
      initialProviders={getAuthProviderSummaries()}
    />
  );
}

export default function AuthPage({ searchParams }: AuthPageProps) {
  return (
    <>
      {/* Keyboard order starts here: Back link, then Google, Microsoft,
          Terms, Privacy inside the auth block. */}
      <Link
        href="/"
        className="fixed left-6 top-6 z-10 inline-flex items-center gap-1.5 text-[13px] text-text-secondary transition-colors hover:text-text-primary focus-visible:text-text-primary"
      >
        <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
        Back to home
      </Link>
      <main
        id="main"
        className="relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-clip px-4 py-10"
      >
        <AmbientGlow variant="center" opacity={0.12} />
        <div className="auth-enter w-full max-w-[340px]">
          <Suspense fallback={null}>
            <AuthScreen searchParams={searchParams} />
          </Suspense>
        </div>
      </main>
    </>
  );
}
