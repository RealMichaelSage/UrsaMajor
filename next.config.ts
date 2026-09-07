import type { NextConfig } from "next";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "/ursa";

const nextConfig: NextConfig = {
  basePath,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.tildacdn.com',
      },
      {
        protocol: 'https',
        hostname: '*.tildacdn.com',
      },
    ],
  },
  serverExternalPackages: ['pg', 'pg-pool', 'drizzle-orm', 'sharp', 'playwright', '@google/genai'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        pg: false,
        'pg-native': false,
        util: false,
        'util/types': false,
      };
    }
    return config;
  },
};

export default nextConfig;
