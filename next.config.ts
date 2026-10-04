import type { NextConfig } from "next";

// Em desenvolvimento usa localhost. Em produção, defina as variáveis de ambiente.
const LOGIN_URL = process.env.LOGIN_URL ?? "http://localhost:8083";
const PRODUTO_URL = process.env.PRODUTO_URL ?? "http://localhost:8081";
const VENDA_URL = process.env.VENDA_URL ?? "http://localhost:8082";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/auth/:path*",
        destination: `${LOGIN_URL}/auth/:path*`, // Microsserviço de Login
      },
      {
        source: "/api/lives/:path*",
        destination: `${PRODUTO_URL}/api/lives/:path*`, // Microsserviço de Produto (controller mapeado em /api/lives)
      },
      {
        source: "/api/vendas/:path*",
        destination: `${VENDA_URL}/vendas/:path*`, // Microsserviço de Vendas
      },
    ];
  },
};

export default nextConfig;