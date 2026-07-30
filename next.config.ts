import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // Browsers still request /favicon.ico; our generated mark lives at /icon.
    return [{ source: "/favicon.ico", destination: "/icon" }];
  },
};

export default nextConfig;
