import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true, // Enable strict mode
  //swcMinify: true, // Faster minification
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL, // Public environment variables
    RESEND_API_KEY: process.env.RESEND_API_KEY, // API key
  },
  images: {
    domains: ["localhost", "example.com"], // Allow external images
  },
  async redirects() {
    return [
      {
        source: "/old-route",
        destination: "/new-route",
        permanent: true, // 301 redirect
      },
    ];
  },
  webpack: (config) => {
    // Custom Webpack configuration
    config.resolve = config.resolve || {};
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
  eslint: {
    ignoreDuringBuilds: true, // Ignore ESLint warnings/errors during builds
  },
};

export default nextConfig;
