import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  env: {
    NEXT_PUBLIC_APP_URL: process.env.NODE_ENV === "development" 
      ? "http://localhost:3000"  // Bruk localhost når vi er i utviklingsmiljø
      : "https://diskgolf.app",   // Bruk produksjonsdomenet når vi er i produksjon
  },

  images: {
    domains: [
      "localhost",
      "diskgolf.app",  // Oppdater til det endelige domenet
      "spill.diskgolf.app",
      "res.cloudinary.com", 
      "randomuser.me",
    ],
  },

  async rewrites() {
    return [
      {
        source: "/spill/:path*",  
        destination: process.env.NODE_ENV === "development" 
          ? "http://localhost:3000/spill/:path*"  // Lokalt subdomene for utvikling
          : "https://spill.diskgolf.app/:path*",  // Bruk produksjons-URL for subdomenet
      },
    ];
  },

  
      async redirects() {
        return [];
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