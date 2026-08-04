import type { NextConfig } from "next";

const BUILD_TIME = new Date();

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: false,
  agentRules: false,
  env: {
    NEXT_PUBLIC_BUILD_YEAR: String(BUILD_TIME.getFullYear()),
    NEXT_PUBLIC_BUILD_TIME: BUILD_TIME.toISOString(),
  },
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    useTypeScriptCli: true,
    exposeTestingApiInProductionBuild: true,
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
