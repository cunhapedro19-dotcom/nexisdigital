/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@nexis/ui",
    "@nexis/db",
    "@nexis/auth",
    "@nexis/core",
    "@nexis/plugin",
    "@nexis/tenant",
    "@nexis/billing",
  ],
  experimental: {
    optimizePackageImports: ["@nexis/ui"],
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "assets.nexisdigital.com.br" },
      { protocol: "https", hostname: "*.r2.cloudflarestorage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/api/tenant/:tenantId/:path*",
        destination: "/api/tenant/:tenantId/:path*",
      },
    ];
  },
};

module.exports = nextConfig;