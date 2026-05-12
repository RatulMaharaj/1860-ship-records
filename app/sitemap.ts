import type { MetadataRoute } from "next";

const SITE_URL = "https://1860.ratulmaharaj.com";

export default function sitemap(): MetadataRoute.Sitemap {
  // The dataset is immutable, so lastModified is fixed.
  // Per-passenger URLs (152,240) are intentionally omitted from the sitemap —
  // including them would produce a ~30 MB sitemap that search engines won't
  // fully crawl. Individual records remain discoverable via internal links
  // from the homepage's search results.
  return [
    {
      url: SITE_URL,
      lastModified: new Date("2026-01-01"),
      changeFrequency: "yearly",
      priority: 1,
    },
  ];
}
