import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  poweredByHeader: false,
  compress: true,
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|webp|avif|ico|woff|woff2|ttf)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    imageSizes: [16, 32, 48, 64, 96, 128, 140, 256, 280, 384],
    minimumCacheTTL: 86400, // cache optimized images for 24 hours to reduce CPU load
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "i.pinimg.com" },
      {
        protocol: "https",
        hostname: "busan-public.s3.ap-south-1.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "1gamestopup.com",
      },
      {
        protocol: "https",
        hostname: "elitedias.com",
      }
    ],
  },
  serverExternalPackages: ["nodemailer"],
  experimental: {
    inlineCss: true,
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'react-icons',
      'react-icons/fi',
      'react-icons/fa',
      'react-icons/gi',
      'react-icons/hi',
      'react-icons/hi2',
      'react-icons/ai',
      'react-icons/md',
      'react-icons/tb',
      'react-icons/io',
      'react-icons/io5',
      'react-icons/bs',
      'react-icons/bi',
      'react-icons/cg',
      'react-icons/ri',
      'react-icons/si',
      'react-icons/vsc',
      'canvas-confetti',
      'axios',
      'crypto-js',
    ],
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
