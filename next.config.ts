import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "ik.imagekit.io",
        pathname: "**",
      },
      {
        // Wildcard: original student app allowed any https CDN (branding logos
        // may point at arbitrary hosts). Prevents next/image crashes.
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
