import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_URL: "https://diskgolf-g11-6bc74f8b60cb.herokuapp.com", // Heroku app URL
  },
  images: {
    domains: ["localhost", "diskgolf-g11-6bc74f8b60cb.herokuapp.com"],
  },
  async rewrites() {
    return [
      {
        source: "/spill/:path*",  // Alle API-kall til /spill
        destination: "https://diskgolf-g11-6bc74f8b60cb.herokuapp.com/spill/:path*", // Proxy til backend
      },
    ];
  },
  webpack: (config) => {
    config.resolve = config.resolve || {};
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
