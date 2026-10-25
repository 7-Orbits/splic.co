import type { Metadata } from "next";
import { Wordmark } from "@/components/wordmark";
import { WaitlistForm } from "@/components/early-access/waitlist-form";

/**
 * Standalone early-access waitlist screen. Rendered outside the `(site)` route
 * group so it ships no navbar or footer — just the Splic wordmark, the intro
 * copy, and the form, centered in the viewport like /auth. The `early-access`
 * class scopes the page's neutral focus treatment in globals.css.
 */
export const metadata: Metadata = {
  title: "Early access",
  description:
    "Join the Splic waitlist. Be among the first to edit with Splic when it launches — we'll email you when it's ready.",
};

export default function EarlyAccessPage() {
  return (
    <main
      id="main"
      className="early-access relative isolate flex min-h-dvh flex-1 flex-col items-center justify-center overflow-clip px-4 py-10"
    >
      <div className="w-full max-w-[360px]">
        <div className="auth-enter flex flex-col items-center text-center">
          <Wordmark markSize={30} />
          <p className="eyebrow mt-6">Early access</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[-0.02em] text-text-primary">
            Be among the first to edit with Splic.
          </h1>
          <p className="mt-3 text-md leading-[1.6] text-text-secondary">
            Splic is getting ready for launch. Join the waitlist and we&apos;ll
            email you when it&apos;s ready.
          </p>
        </div>

        <WaitlistForm />
      </div>
    </main>
  );
}
