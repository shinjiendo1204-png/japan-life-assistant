import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ① Anthropic SDKをここから削除
  transpilePackages: ['@supabase/supabase-js'],

  // ② 画像最適化
  images: {
    unoptimized: true,
  },


  serverExternalPackages: ['@anthropic-ai/sdk'],
};

export default nextConfig;