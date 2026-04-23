import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // WebP/AVIF optimization
    formats: ["image/avif", "image/webp"],
    // Responsive image sizes
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimize layout shift
    minimumCacheTTL: 60 * 60 * 24, // 24h cache
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "8000",
        pathname: "/storage/**",
      },
      {
        protocol: "https",
        hostname: "**",
        pathname: "/storage/**",
      },
    ],
  },
  // Compress responses
  compress: true,
  // Power by header removal
  poweredByHeader: false,
  // Strict mode for better performance warnings
  reactStrictMode: true,
  // Bundle analyzer friendly
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons"],
  },
};

export default nextConfig;
