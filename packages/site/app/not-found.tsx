import { Button } from "@/components/ui/button";
import { ctaHref, ctaLabel } from "@/lib/site-config";

export default function NotFound() {
  return (
    <main id="main" className="flex flex-1 items-center justify-center">
      <div className="container-page flex flex-col items-center py-24 text-center">
        <p className="eyebrow">404</p>
        <h1
          className="headline mt-4 text-page text-text-primary"
          style={{ letterSpacing: "-0.03em" }}
        >
          Page not found.
        </h1>
        <p className="lede mt-5 max-w-[480px]">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="/" size="lg">
            Back to home
          </Button>
          <Button href={ctaHref} variant="secondary" size="lg">
            {ctaLabel}
          </Button>
        </div>
      </div>
    </main>
  );
}
