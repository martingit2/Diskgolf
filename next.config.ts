// Fil: next.config.ts
// Formål: Konfigurerer innstillinger for Next.js-applikasjonen.
//         Inkluderer aktivering av React Strict Mode, definisjon av miljøvariabler (spesielt NEXT_PUBLIC_APP_URL for utvikling/produksjon),
//         konfigurasjon av tillatte domener for bilder (Next/Image), Webpack fallbacks, og deaktivering av ESLint under bygging.
// Utvikler: Martin Pettersen
// AI-støtte: Benyttet under utvikling for kodekvalitet, oppdateringer og feilsøking.


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