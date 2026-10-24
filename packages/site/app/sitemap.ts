import type { MetadataRoute } from "next";
import { plugins } from "@/content/plugins";
import { siteDomain } from "@/content/release";

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [
    "",
    "/features",
    "/plugins",
    "/pricing",
    "/download",
    "/how-it-works",
    "/contact",
    "/privacy",
    "/terms",
    "/refunds",
    "/cookies",
  ];

  const now = new Date();

  const pages = routes.map((route) => ({
    url: `${siteDomain}${route}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: route === "" ? 1 : 0.7,
  }));

  const pluginPages = plugins.map((plugin) => ({
    url: `${siteDomain}/plugins/${plugin.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.5,
  }));

  return [...pages, ...pluginPages];
}
