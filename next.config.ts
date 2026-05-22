import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV !== "production",
  register: true,
  skipWaiting: true,
  runtimeCaching: [
    {
      urlPattern: /^https?.*\/(?:api\/flights|search).*$/i,
      handler: "StaleWhileRevalidate",
      options: { cacheName: "skybook-search" },
    },
    {
      urlPattern: /\/_next\/static\/.*/i,
      handler: "CacheFirst",
      options: { cacheName: "skybook-static" },
    },
    {
      urlPattern: /^https?.*\/my-bookings.*$/i,
      handler: "NetworkFirst",
      options: { cacheName: "skybook-bookings" },
    },
  ],
});

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: process.env.NODE_ENV === "development",
  },
};

export default withPWA(nextConfig);
