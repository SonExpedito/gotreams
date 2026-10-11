import type { NextConfig } from "next";

// O Gateway na porta 8080 centraliza todas as requisições do sistema
const GATEWAY_URL = process.env.GATEWAY_URL ?? "http://localhost:8080";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        // /api/auth/... -> repassa para o Gateway em /auth/... -> Login (8083)
        source: "/api/auth/:path*",
        destination: `${GATEWAY_URL}/auth/:path*`,
      },
      {
        // /api/lives -> repassa para o Gateway em /lives -> Produto (8082)
        source: "/api/lives",
        destination: `${GATEWAY_URL}/lives`,
      },
      {
        // /api/lives/... -> repassa para o Gateway em /lives/... -> Produto (8082)
        source: "/api/lives/:path*",
        destination: `${GATEWAY_URL}/lives/:path*`,
      },
      {
        // /api/vendas/... -> repassa para o Gateway em /vendas/... -> Venda (8081)
        source: "/api/vendas/:path*",
        destination: `${GATEWAY_URL}/vendas/:path*`,
      },
    ];
  },
};

export default nextConfig;