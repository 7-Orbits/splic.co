import type { MetadataRoute } from "next";
import { siteDomain } from "@/content/release";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/console",
    },
    sitemap: `${siteDomain}/sitemap.xml`,
  };
}
