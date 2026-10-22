import { Cta } from "./cta";
import { EditorShowcase } from "./editor-showcase";
import { Reveal } from "./reveal";
import { downloadHref } from "@/lib/site-config";

export function Hero() {
  return (
    <section
      id="top"
      aria-labelledby="hero-title"
      className="pb-14 pt-14 md:pb-21 md:pt-21"
    >
      <div className="container-page">
        <Reveal>
          <p className="eyebrow">A new way to edit</p>
        </Reveal>

        <Reveal delay={70}>
          <h1
            id="hero-title"
            className="headline mt-5 max-w-4xl text-4xl text-text-primary"
          >
            <span className="block">You bring the vision.</span>
            <span className="block">Splic does the editing.</span>
          </h1>
        </Reveal>

        <Reveal delay={140}>
          <p className="lede mt-5 max-w-2xl text-xl">
            Describe the video you want. Splic works inside your editing
            workspace, checks the result, and refines it — while you stay in
            control.
          </p>
        </Reveal>

        <Reveal delay={210}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Cta href={downloadHref}>Download Splic</Cta>
            <Cta href="#how-it-works" variant="ghost">
              See how it works ↗
            </Cta>
          </div>
        </Reveal>

        <Reveal delay={280} className="mt-14">
          <EditorShowcase />
        </Reveal>
      </div>
    </section>
  );
}
