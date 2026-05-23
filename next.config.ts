
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
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
