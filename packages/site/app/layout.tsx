import type { Metadata, Viewport } from "next";
import "./globals.css";

const siteDescription =
  "Describe the video you want in plain language. Splic works inside your editing workspace, checks the result, and refines it — while you stay in control. A desktop product by 7.Orbits, in development.";

export const metadata: Metadata = {
  metadataBase: new URL("https://splic.co"),
  title: {
    default: "Splic — AI-assisted desktop video editor",
    template: "%s · Splic.co",
  },
  description: siteDescription,
  keywords: [
    "Splic",
    "video editor",
    "AI video editing",
    "desktop application",
    "natural language editing",
    "7.Orbits",
  ],
  applicationName: "Splic",
  openGraph: {
    type: "website",
    siteName: "Splic.co",
    title: "Splic — AI-assisted desktop video editor",
    description: siteDescription,
    url: "https://splic.co",
    locale: "en_US",
  },
  twitter: {
    card: "summary",
    title: "Splic — AI-assisted desktop video editor",
    description: siteDescription,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased" data-scroll-behavior="smooth">
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `document.documentElement.classList.add("js")`,
          }}
        />
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var els=document.querySelectorAll("[data-reveal]");if(!els.length)return;if(typeof IntersectionObserver==="undefined"||window.matchMedia("(prefers-reduced-motion: reduce)").matches){for(var i=0;i<els.length;i++)els[i].setAttribute("data-visible","true");return}var io=new IntersectionObserver(function(entries){for(var j=0;j<entries.length;j++){if(entries[j].isIntersecting){entries[j].target.setAttribute("data-visible","true");io.unobserve(entries[j].target)}}},{rootMargin:"0px 0px -8% 0px",threshold:0.08});for(var k=0;k<els.length;k++)io.observe(els[k])})()`,
          }}
        />
      </body>
    </html>
  );
}
