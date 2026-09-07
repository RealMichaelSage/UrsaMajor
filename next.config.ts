import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['pg', 'pg-pool', 'drizzle-orm', 'sharp', 'playwright', '@google/genai'],
  images: {
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
