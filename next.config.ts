import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ① 古い端末向けのライブラリ変換
  transpilePackages: ['@anthropic-ai/sdk', '@supabase/supabase-js'],

  // ② 画像最適化（古いSafariでのトラブル防止）
  images: {
    unoptimized: true,
  },

  // ③ サーバーサイドパッケージの設定
  serverExternalPackages: ['@anthropic-ai/sdk'],

  // 注意: swcMinify は削除しました（最新版では不要）
};

export default nextConfig;