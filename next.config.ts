
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  // TypeScript 7 (native/Go compiler) removed the programmatic JS API Next used
  // for build-time type checking, so shell out to the local `tsc` CLI instead.
  // Requires next >= 16.3 canary (PR vercel/next.js#95639).
  experimental: {
    useTypeScriptCli: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.scdn.co", pathname: "/image/**" },
      {
        protocol: "https",
        hostname: "convex-portfolio.shahathir.me",
        pathname: "/api/storage/**",
      },
    ],
  },
};

export default nextConfig;
