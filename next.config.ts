import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Daftarkan pdf-lib sebagai server-only package agar tidak di-bundle ke client
  serverExternalPackages: ['pdf-lib'],
  experimental: {
    // Naikkan batas ukuran body untuk Server Actions (jika dipakai)
    serverActions: {
      bodySizeLimit: '200mb',
    },
  },
};

export default nextConfig;
