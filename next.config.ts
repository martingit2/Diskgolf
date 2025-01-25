import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_APP_URL: "https://diskgolf.app",  // Bruker ditt eget domene
  },

  images: {
    domains: [
      "localhost",
      "diskgolf.app",  // Oppdater til det endelige domenet
      "spill.diskgolf.app", 
    ],
  },

  async rewrites() {
    return [
      {
        source: "/spill/:path*",  
        destination: "https://spill.diskgolf.app/:path*",  // Oppdatert til subdomenet
      },
    ];
  },

  async redirects() {
    return [
      {
        source: "/spill",
        destination: "https://spill.diskgolf.app/spill",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "spill.diskgolf.app" }],
        destination: "https://spill.diskgolf.app/spill",
        permanent: true,
      },
      {
        source: "/",
        has: [{ type: "host", value: "diskgolf.app" }],
        destination: "https://diskgolf.app",
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
