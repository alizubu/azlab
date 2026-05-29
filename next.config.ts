import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'fonts.googleapis.com' },
      { protocol: 'https', hostname: 'fonts.gstatic.com' },
    ],
  },

  // Allow LAN access during development (e.g. from phone on same network)
  allowedDevOrigins: ['192.168.0.239'],

  turbopack: {
    resolveAlias: {
      canvas: './src/lib/canvas/canvasShim.ts',
    },
  },
};

export default nextConfig;
