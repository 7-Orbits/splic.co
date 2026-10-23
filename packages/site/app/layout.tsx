import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import { siteDomain } from "@/content/release";
import "./globals.css";

/** Linear reference font (DESIGN.md font.family.primary). Geist Mono stays
 * for the workspace mock's mono chrome. */
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const siteDescription =
  "Splic is a desktop video editor with an AI agent that carries out supported edits from plain-language instructions while you stay in control.";

export const metadata: Metadata = {
  metadataBase: new URL(siteDomain),
  title: {
    default: "Splic | AI video editing, you stay in control",
    template: "%s · Splic",
  },
  description: siteDescription,
  keywords: [
    "Splic",
    "AI video editor",
    "desktop video editing",
    "video editing plugins",
    "natural language editing",
    "7.Orbits",
  ],
  applicationName: "Splic",
  openGraph: {
    type: "website",
    siteName: "Splic",
    title: "Splic — AI video editing, you stay in control",
    description: siteDescription,
    url: siteDomain,
    locale: "en_US",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Splic" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Splic — AI video editing, you stay in control",
    description: siteDescription,
    images: ["/og.png"],
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: "#08090b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`js h-full antialiased ${inter.variable} ${GeistMono.variable}`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-full flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `setTimeout(function(){if(!window.__splicMotionReady){document.documentElement.classList.remove("js")}},2500)`,
          }}
        />
        <noscript>
          <style>{`
            [data-reveal],
            [data-reveal-group] > *,
            [data-reveal-stagger] > *,
            [data-hero-line],
            [data-hero-fade],
            [data-hero-preview],
            [data-glow-hero],
            [data-nav-intro] {
              opacity: 1 !important;
              transform: none !important;
              clip-path: none !important;
            }
          `}</style>
        </noscript>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        {children}
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
