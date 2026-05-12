import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  serverExternalPackages: ["better-sqlite3"],
  allowedDevOrigins: ["macbook-pro.tail7ad77.ts.net"],
  // Bundle the OG fonts and the SQLite DB into the standalone runtime image.
  outputFileTracingIncludes: {
    "/opengraph-image": ["./app/og-fonts/**/*"],
    "/passenger/[id]/opengraph-image": [
      "./app/og-fonts/**/*",
      "./data/passengers.db",
    ],
    "/passenger/[id]": ["./data/passengers.db"],
    "/api/search/*": ["./data/passengers.db"],
    "/api/stats/*": ["./data/passengers.db"],
  },
};

export default nextConfig;
