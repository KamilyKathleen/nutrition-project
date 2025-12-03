import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // Desabilita ESLint durante o build (apenas para produção)
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Desabilita verificação de tipos durante o build (apenas para produção)
    ignoreBuildErrors: true,
  }
};

export default nextConfig;
