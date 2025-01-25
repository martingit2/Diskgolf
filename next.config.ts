import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: {
    NEXT_PUBLIC_APP_URL: "https://diskgolf.app",  // Bruk ditt eget domene
  },
  images: {
    domains: ["localhost", "diskgolf-g11-6bc74f8b60cb.herokuapp.com", "spill.diskgolf.app"],
  },
  async rewrites() {
    return [
      {
        source: "/spill/:path*",  
        destination: "https://diskgolf-g11-6bc74f8b60cb.herokuapp.com/spill/:path*",
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/spill",
        destination: "https://diskgolf-g11-6bc74f8b60cb.herokuapp.com/spill",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "spill.diskgolf.app" }],
        destination: "https://diskgolf-g11-6bc74f8b60cb.herokuapp.com/spill",
        permanent: true,
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
