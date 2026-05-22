declare module "next-pwa" {
  import type { NextConfig } from "next";

  interface RuntimeCaching {
    urlPattern: RegExp;
    handler: string;
    options?: {
      cacheName?: string;
      expiration?: {
        maxEntries?: number;
        maxAgeSeconds?: number;
      };
    };
  }

  interface PWAConfig {
    dest: string;
    disable?: boolean;
    register?: boolean;
    skipWaiting?: boolean;
    runtimeCaching?: RuntimeCaching[];
  }

  export default function withPWAInit(config: PWAConfig): (nextConfig: NextConfig) => NextConfig;
}
