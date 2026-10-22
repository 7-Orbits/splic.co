import { Cta } from "./cta";
import { Reveal } from "./reveal";
import { Section } from "./section";
import { downloadPending, siteConfig, startHref } from "@/lib/site-config";

export function FinalCta() {
  const { download, waitlist } = siteConfig.links;

  let status: string;
  if (download) {
    status = "Downloads are available — grab Splic and start editing.";
  } else if (waitlist) {
    status =
      "Early access is opening in stages — join the waitlist to hear when Splic is ready for you.";
  } else {
    status =
      "Splic is in development. There is no download or waitlist yet — this page will be updated when that changes.";
  }

  return (
    <Section id="download" labelledBy="cta-title">
      <div className="container-page">
        <Reveal>
          <div className="border border-line bg-surface-strong px-8 py-14 text-center md:px-14 md:py-21">
            <h2
              id="cta-title"
              className="headline mx-auto max-w-2xl text-3xl text-text-primary"
            >
              Make room for the creative part.
            </h2>
            <p className="lede mx-auto mt-5 max-w-xl text-xl">
              Bring your vision. Let Splic handle more of the editing work.
            </p>

            <div className="mt-8 flex flex-col items-center gap-4">
              <Cta
                href={downloadPending ? undefined : startHref}
                external={Boolean(download ?? waitlist)}
                className="w-full sm:w-auto"
              >
                Get started with Splic ↗
              </Cta>
              <p className="max-w-md text-sm text-text-tertiary">
                {status}
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
