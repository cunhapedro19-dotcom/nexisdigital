/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    "@nexis/ui",
    "@nexis/db",
    "@nexis/core",
    "@nexis/tenant",
    "@nexis/plugin",
    "@nexis/plugin-pousadas",
    "@nexis/plugin-cardapio",
    "@nexis/plugin-catalogo",
    "@nexis/plugin-livrarias",
    "@nexis/plugin-site-institucional",
    "@nexis/plugin-gestao-empresarial",
    "@nexis/plugin-gestao-rh",
  ],
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
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
