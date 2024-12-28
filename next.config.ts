/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true, // Aktiverer streng modus
  swcMinify: true, // Raskere minifisering
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL, // Legg til offentlige miljøvariabler
    RESEND_API_KEY: process.env.RESEND_API_KEY, // API-nøkkel
  },
  images: {
    domains: ["localhost", "example.com"], // Eksterne bilder tillates
  },
  async redirects() {
    return [
      {
        source: "/old-route",
        destination: "/new-route",
        permanent: true, // 301-redirect
      },
    ];
  },
  webpack: (config: import("webpack").Configuration) => {
    // Tilpass Webpack-oppsett hvis nødvendig
    config.resolve = config.resolve || {};
    config.resolve.fallback = { fs: false, net: false, tls: false };
    return config;
  },
};

module.exports = nextConfig;
