import { SiteMotion } from "@/components/motion/site-motion";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="site-shell relative isolate flex min-h-full flex-1 flex-col">
      <div className="site-gradient" aria-hidden="true" />
      <SiteHeader />
      {children}
      <SiteFooter />
      <SiteMotion />
    </div>
  );
}
