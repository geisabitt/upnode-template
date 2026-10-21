import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Resolve metadata/notFound before streaming the response, avoiding soft 404s.
  htmlLimitedBots: /.*/,
  async headers() {
    return ['/api/:path*', '/admin/:path*', '/pedido/:path*', '/carrinho', '/loja/pedido/:path*', '/loja/carrinho', '/loja/checkout', '/loja/meus-pedidos', '/offline'].map(source => ({
      source, headers: [{ key: 'Cache-Control', value: 'private, no-store' }, { key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
    }))
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*',
      },
    ],
  },
  allowedDevOrigins: ['192.168.0.101'],
};

export default nextConfig;
